import database from '../index';
import { Thread } from '../models/message';
import { Inquiry, InquiryResponse } from '../models/inquiry';
import log from '@/log';

interface MigrationResult {
  totalThreadsChecked: number;
  threadsWithMissingInquiryId: number;
  threadsWithInquiryResponses: number;
  successfulMigrations: number;
  skippedThreads: number;
  errors: string[];
  migrationsByInquiry: Record<string, number>; // inquiry title -> count of migrated threads
}

/**
 * Migrates threads to include inquiryId based on direct InquiryResponse relationships.
 * This migration only handles threads that have a direct, verifiable connection to an inquiry
 * through an InquiryResponse document.
 * 
 * Safe Migration Strategy:
 * 1. Find threads with missing inquiryId
 * 2. Find InquiryResponse documents that reference these threads
 * 3. Find Inquiry documents that contain these responses
 * 4. Update threads with the correct inquiryId
 * 
 * @param dryRun - If true, only reports what would be migrated without making changes
 * @returns Migration results summary
 */
export async function migrateInquiryThreads(dryRun: boolean = true): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalThreadsChecked: 0,
    threadsWithMissingInquiryId: 0,
    threadsWithInquiryResponses: 0,
    successfulMigrations: 0,
    skippedThreads: 0,
    errors: [],
    migrationsByInquiry: {}
  };

  try {
    // Step 1: Find all threads with missing inquiryId
    const threadsWithMissingInquiryId = await Thread.find({
      $or: [
        { inquiryId: { $exists: false } },
        { inquiryId: null },
        { inquiryId: undefined }
      ]
    });

    result.totalThreadsChecked = await Thread.countDocuments();
    result.threadsWithMissingInquiryId = threadsWithMissingInquiryId.length;

    // Step 2: Process threads with missing inquiryId (parallelized with controlled concurrency)
    const BATCH_SIZE = 10; // Process 10 threads concurrently to avoid overwhelming the database
    const threadBatches: typeof threadsWithMissingInquiryId[] = [];
    
    // Split threads into batches for parallel processing
    for (let i = 0; i < threadsWithMissingInquiryId.length; i += BATCH_SIZE) {
      threadBatches.push(threadsWithMissingInquiryId.slice(i, i + BATCH_SIZE));
    }

    // Process each batch in parallel
    for (let batchIndex = 0; batchIndex < threadBatches.length; batchIndex++) {
      const batch = threadBatches[batchIndex];

      // Process all threads in this batch concurrently
      const batchPromises = batch.map(async (thread) => {
        try {
          // Find InquiryResponse that references this thread
          const inquiryResponse = await InquiryResponse.findOne({ 
            threadId: thread._id 
          });

          if (!inquiryResponse) {
            // No InquiryResponse found - this thread is not related to any inquiry
            // This is normal for threads from agent playground, etc.
            result.skippedThreads++;
            return { type: 'skipped', threadId: thread._id };
          }

          // Find Inquiry that contains this response
          const inquiry = await Inquiry.findOne({
            responses: inquiryResponse._id
          });

          if (!inquiry) {
            // InquiryResponse exists but no Inquiry contains it - data inconsistency
            const errorMessage = `InquiryResponse ${inquiryResponse._id} found for thread ${thread._id} but no Inquiry contains this response`;
            result.errors.push(errorMessage);
            return { type: 'error', threadId: thread._id, error: errorMessage };
          }

          result.threadsWithInquiryResponses++;

          if (dryRun) {
            // Track the potential migration by inquiry title for dry run
            const inquiryTitle = inquiry.data?.settings?.title || 'Untitled';
            if (!result.migrationsByInquiry[inquiryTitle]) {
              result.migrationsByInquiry[inquiryTitle] = 0;
            }
            result.migrationsByInquiry[inquiryTitle]++;

            return { 
              type: 'dry-run', 
              threadId: thread._id, 
              inquiryId: inquiry._id,
              inquiryTitle: inquiry.data?.settings?.title || 'Untitled'
            };
          } else {
            // Perform the actual migration
            await Thread.updateOne(
              { _id: thread._id },
              { $set: { inquiryId: inquiry._id.toString() } }
            );

            // Track the migration by inquiry title
            const inquiryTitle = inquiry.data?.settings?.title || 'Untitled';
            if (!result.migrationsByInquiry[inquiryTitle]) {
              result.migrationsByInquiry[inquiryTitle] = 0;
            }
            result.migrationsByInquiry[inquiryTitle]++;

            result.successfulMigrations++;
            
            return { 
              type: 'migrated', 
              threadId: thread._id, 
              inquiryId: inquiry._id,
              inquiryTitle: inquiry.data?.settings?.title || 'Untitled'
            };
          }

        } catch (error) {
          const errorMessage = `Error processing thread ${thread._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMessage);
          return { type: 'error', threadId: thread._id, error: errorMessage };
        }
      });

      // Wait for all threads in this batch to complete
      await Promise.all(batchPromises);
    }

    // Step 3: Validation (if not dry run)
    if (!dryRun && result.successfulMigrations > 0) {
      // Verify the migrations were successful
      const remainingThreadsWithMissingInquiryId = await Thread.countDocuments({
        $or: [
          { inquiryId: { $exists: false } },
          { inquiryId: null },
          { inquiryId: undefined }
        ]
      });
    }

    // Final summary
    log.info({
      message: 'Migration completed',
      dryRun,
      result
    });

    // Display inquiry-specific summary
    if (Object.keys(result.migrationsByInquiry).length > 0) {
      log.info({
        message: 'Migrations by inquiry title',
        migrationsByInquiry: result.migrationsByInquiry
      });
    }

    return result;

  } catch (error) {
    const errorMessage = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMessage);
    log.error({
      message: 'Migration failed with critical error',
      error: errorMessage
    });
    throw error;
  }
}

/**
 * Validates the current state of thread-inquiry relationships
 * Useful for understanding the data before and after migration
 */
export async function validateThreadInquiryRelationships(): Promise<{
  totalThreads: number;
  threadsWithInquiryId: number;
  threadsWithMissingInquiryId: number;
  threadsWithInquiryResponses: number;
  orphanedThreads: number;
  inconsistentRelationships: string[];
}> {
  const totalThreads = await Thread.countDocuments();
  
  const threadsWithInquiryId = await Thread.countDocuments({
    inquiryId: { $exists: true, $ne: null }
  });

  const threadsWithMissingInquiryId = await Thread.countDocuments({
    $or: [
      { inquiryId: { $exists: false } },
      { inquiryId: null },
      { inquiryId: undefined }
    ]
  });

  // Count threads that have InquiryResponse relationships but missing inquiryId
  const threadsWithResponses = await Thread.aggregate([
    {
      $match: {
        $or: [
          { inquiryId: { $exists: false } },
          { inquiryId: null },
          { inquiryId: undefined }
        ]
      }
    },
    {
      $lookup: {
        from: 'inquiryresponses',
        localField: '_id',
        foreignField: 'threadId',
        as: 'responses'
      }
    },
    {
      $match: {
        'responses.0': { $exists: true }
      }
    },
    {
      $count: 'threadsWithInquiryResponses'
    }
  ]);

  const threadsWithInquiryResponses = threadsWithResponses[0]?.threadsWithInquiryResponses || 0;
  const orphanedThreads = threadsWithMissingInquiryId - threadsWithInquiryResponses;

  // Check for inconsistent relationships
  const inconsistentRelationships: string[] = [];

  // Find threads with inquiryId that don't match their InquiryResponse relationships
  const threadsWithPossibleInconsistencies = await Thread.aggregate([
    {
      $match: {
        inquiryId: { $exists: true, $ne: null }
      }
    },
    {
      $lookup: {
        from: 'inquiryresponses',
        localField: '_id',
        foreignField: 'threadId',
        as: 'responses'
      }
    },
    {
      $lookup: {
        from: 'inquiries',
        localField: 'responses._id',
        foreignField: 'responses',
        as: 'inquiries'
      }
    },
    {
      $match: {
        $expr: {
          $and: [
            { $gt: [{ $size: '$responses' }, 0] },
            { $gt: [{ $size: '$inquiries' }, 0] },
            { $ne: ['$inquiryId', { $toString: { $arrayElemAt: ['$inquiries._id', 0] } }] }
          ]
        }
      }
    }
  ]);

  for (const thread of threadsWithPossibleInconsistencies) {
    inconsistentRelationships.push(
      `Thread ${thread._id} has inquiryId ${thread.inquiryId} but InquiryResponse points to inquiry ${thread.inquiries[0]?._id}`
    );
  }

  return {
    totalThreads,
    threadsWithInquiryId,
    threadsWithMissingInquiryId,
    threadsWithInquiryResponses,
    orphanedThreads,
    inconsistentRelationships
  };
}

// CLI runner function for standalone execution
export async function runMigration() {
  try {
    await database.init();
    
    // First, validate current state
    console.log('=== Current State Validation ===');
    const validation = await validateThreadInquiryRelationships();
    console.log(JSON.stringify(validation, null, 2));

    // Run dry run first
    console.log('\n=== Dry Run Migration ===');
    const dryRunResult = await migrateInquiryThreads(true);
    console.log(JSON.stringify(dryRunResult, null, 2));

    // Display inquiry breakdown in a readable format
    if (Object.keys(dryRunResult.migrationsByInquiry).length > 0) {
      console.log('\n📊 Threads to migrate by inquiry:');
      const sortedInquiries = Object.entries(dryRunResult.migrationsByInquiry)
        .sort(([,a], [,b]) => b - a); // Sort by count descending
      
      for (const [title, count] of sortedInquiries) {
        console.log(`  • ${title}: ${count} thread${count === 1 ? '' : 's'}`);
      }
    }

    // Ask for confirmation before actual migration
    if (dryRunResult.threadsWithInquiryResponses > 0) {
      console.log(`\n⚠️  Migration would update ${dryRunResult.threadsWithInquiryResponses} threads`);
      console.log('To run the actual migration, call migrateInquiryThreads(false)');
    } else {
      console.log('\n✅ No threads found that need migration');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  runMigration();
}
