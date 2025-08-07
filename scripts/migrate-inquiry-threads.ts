/**
 * Migration Runner Script for Inquiry Thread Migration
 *
 * This script runs the inquiry thread migration to populate missing inquiryId values
 * in threads that have direct relationships with InquiryResponse documents.
 *
 * Usage:
 *   npm run migrate:inquiry-threads          # Dry run only
 *   npm run migrate:inquiry-threads --apply  # Apply changes
 */

import database from '../src/database';
import { Thread } from '../src/database/models/message';
import { Inquiry, InquiryResponse } from '../src/database/models/inquiry';
import log from '../src/log';

interface MigrationResult {
  totalThreadsChecked: number;
  threadsWithMissingInquiryId: number;
  threadsWithInquiryResponses: number;
  successfulMigrations: number;
  skippedThreads: number;
  errors: string[];
  migrationsByInquiry: Record<string, number>;
}

/**
 * Migrates threads to include inquiryId based on direct InquiryResponse relationships.
 */
async function migrateInquiryThreads(
  dryRun: boolean = true,
): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalThreadsChecked: 0,
    threadsWithMissingInquiryId: 0,
    threadsWithInquiryResponses: 0,
    successfulMigrations: 0,
    skippedThreads: 0,
    errors: [],
    migrationsByInquiry: {},
  };

  try {
    const threadsWithMissingInquiryId = await Thread.find({
      $or: [
        { inquiryId: { $exists: false } },
        { inquiryId: null },
        { inquiryId: undefined },
      ],
    });

    result.totalThreadsChecked = await Thread.countDocuments();
    result.threadsWithMissingInquiryId = threadsWithMissingInquiryId.length;

    const BATCH_SIZE = 10;
    const threadBatches: (typeof threadsWithMissingInquiryId)[] = [];

    for (let i = 0; i < threadsWithMissingInquiryId.length; i += BATCH_SIZE) {
      threadBatches.push(threadsWithMissingInquiryId.slice(i, i + BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < threadBatches.length; batchIndex++) {
      const batch = threadBatches[batchIndex];

      const batchPromises = batch.map(async (thread) => {
        try {
          const inquiryResponse = await InquiryResponse.findOne({
            threadId: thread._id,
          });

          if (!inquiryResponse) {
            result.skippedThreads++;
            return { type: 'skipped' };
          }

          const inquiry = await Inquiry.findOne({
            responses: inquiryResponse._id,
          });

          if (!inquiry) {
            const errorMessage =
              'InquiryResponse found but no parent Inquiry contains this response';
            result.errors.push(errorMessage);
            return { type: 'error', error: errorMessage };
          }

          result.threadsWithInquiryResponses++;

          if (dryRun) {
            const inquiryTitle = inquiry.data?.settings?.title
              ? '[INQUIRY_TITLE]'
              : 'Untitled';
            if (!result.migrationsByInquiry[inquiryTitle]) {
              result.migrationsByInquiry[inquiryTitle] = 0;
            }
            result.migrationsByInquiry[inquiryTitle]++;

            return {
              type: 'dry-run',
              inquiryTitle,
            };
          } else {
            await Thread.updateOne(
              { _id: thread._id },
              { $set: { inquiryId: inquiry._id.toString() } },
            );

            const inquiryTitle = inquiry.data?.settings?.title
              ? '[INQUIRY_TITLE]'
              : 'Untitled';
            if (!result.migrationsByInquiry[inquiryTitle]) {
              result.migrationsByInquiry[inquiryTitle] = 0;
            }
            result.migrationsByInquiry[inquiryTitle]++;

            result.successfulMigrations++;

            return {
              type: 'migrated',
              inquiryTitle,
            };
          }
        } catch {
          const errorMessage = `Error processing thread`;
          result.errors.push(errorMessage);
          return { type: 'error', error: errorMessage };
        }
      });

      await Promise.all(batchPromises);
    }

    if (!dryRun && result.successfulMigrations > 0) {
      const remainingThreadsWithMissingInquiryId = await Thread.countDocuments({
        $or: [
          { inquiryId: { $exists: false } },
          { inquiryId: null },
          { inquiryId: undefined },
        ],
      });

      log.info({
        message: 'Post-migration validation',
        remainingThreadsWithMissingInquiryId,
        expectedRemaining:
          result.threadsWithMissingInquiryId - result.successfulMigrations,
      });
    }

    return result;
  } catch (error) {
    const errorMessage = `Migration failed`;
    result.errors.push(errorMessage);
    log.error({
      message: 'Migration failed with critical error',
      error: errorMessage,
    });
    throw error;
  }
}

/**
 * Validates the current state of thread-inquiry relationships
 */
async function validateThreadInquiryRelationships(): Promise<{
  totalThreads: number;
  threadsWithInquiryId: number;
  threadsWithMissingInquiryId: number;
  threadsWithInquiryResponses: number;
  orphanedThreads: number;
  inconsistentRelationships: number;
}> {
  const totalThreads = await Thread.countDocuments();

  const threadsWithInquiryId = await Thread.countDocuments({
    inquiryId: { $exists: true, $ne: null },
  });

  const threadsWithMissingInquiryId = await Thread.countDocuments({
    $or: [
      { inquiryId: { $exists: false } },
      { inquiryId: null },
      { inquiryId: undefined },
    ],
  });

  // Count threads that have InquiryResponse relationships but missing inquiryId
  const threadsWithResponses = await Thread.aggregate([
    {
      $match: {
        $or: [
          { inquiryId: { $exists: false } },
          { inquiryId: null },
          { inquiryId: undefined },
        ],
      },
    },
    {
      $lookup: {
        from: 'inquiryresponses',
        localField: '_id',
        foreignField: 'threadId',
        as: 'responses',
      },
    },
    {
      $match: {
        'responses.0': { $exists: true },
      },
    },
    {
      $count: 'threadsWithInquiryResponses',
    },
  ]);

  const threadsWithInquiryResponses =
    threadsWithResponses[0]?.threadsWithInquiryResponses || 0;
  const orphanedThreads =
    threadsWithMissingInquiryId - threadsWithInquiryResponses;

  const threadsWithPossibleInconsistencies = await Thread.aggregate([
    {
      $match: {
        inquiryId: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: 'inquiryresponses',
        localField: '_id',
        foreignField: 'threadId',
        as: 'responses',
      },
    },
    {
      $lookup: {
        from: 'inquiries',
        localField: 'responses._id',
        foreignField: 'responses',
        as: 'inquiries',
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $gt: [{ $size: '$responses' }, 0] },
            { $gt: [{ $size: '$inquiries' }, 0] },
            {
              $ne: [
                '$inquiryId',
                { $toString: { $arrayElemAt: ['$inquiries._id', 0] } },
              ],
            },
          ],
        },
      },
    },
    {
      $count: 'inconsistentCount',
    },
  ]);

  const inconsistentRelationships =
    threadsWithPossibleInconsistencies[0]?.inconsistentCount || 0;

  return {
    totalThreads,
    threadsWithInquiryId,
    threadsWithMissingInquiryId,
    threadsWithInquiryResponses,
    orphanedThreads,
    inconsistentRelationships,
  };
}

async function runStandaloneValidation() {
  await database.init();

  console.log('=== Current State Validation ===');
  const validation = await validateThreadInquiryRelationships();
  console.log(JSON.stringify(validation, null, 2));

  console.log('\n=== Dry Run Migration ===');
  const dryRunResult = await migrateInquiryThreads(true);

  console.log({
    totalThreadsChecked: dryRunResult.totalThreadsChecked,
    threadsWithMissingInquiryId: dryRunResult.threadsWithMissingInquiryId,
    threadsWithInquiryResponses: dryRunResult.threadsWithInquiryResponses,
    skippedThreads: dryRunResult.skippedThreads,
    errorCount: dryRunResult.errors.length,
  });

  if (Object.keys(dryRunResult.migrationsByInquiry).length > 0) {
    console.log('\nThreads to migrate by inquiry:');
    const sortedInquiries = Object.entries(
      dryRunResult.migrationsByInquiry,
    ).sort(([, a], [, b]) => b - a);

    for (const [title, count] of sortedInquiries) {
      console.log(`  • ${title}: ${count} thread${count === 1 ? '' : 's'}`);
    }
  }

  if (dryRunResult.threadsWithInquiryResponses > 0) {
    console.log(
      `\nMigration would update ${dryRunResult.threadsWithInquiryResponses} threads`,
    );
    console.log(
      'To run the actual migration, use: npm run migrate:inquiry-threads --apply',
    );
  } else {
    console.log('\nNo threads found that need migration');
  }
}

(async () => {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');
  const isDryRun = !shouldApply;

  try {
    await database.init();

    if (process.argv.length === 2) {
      await runStandaloneValidation();
      log.info('Standalone validation completed');
    } else {
      log.info({ message: 'Starting Inquiry Thread Migration' });
      log.info({ message: `Mode: ${isDryRun ? 'DRY RUN' : 'APPLY CHANGES'}` });

      log.info({ message: 'Database connection established' });

      log.info({ message: 'Current State Validation' });
      const validation = await validateThreadInquiryRelationships();

      log.info({
        message: 'Thread validation results',
        totalThreads: validation.totalThreads,
        threadsWithInquiryId: validation.threadsWithInquiryId,
        threadsWithMissingInquiryId: validation.threadsWithMissingInquiryId,
        threadsWithInquiryResponses: validation.threadsWithInquiryResponses,
        orphanedThreads: validation.orphanedThreads,
      });

      if (validation.inconsistentRelationships > 0) {
        log.warn({
          message: 'Inconsistent relationships found',
          inconsistentRelationshipsCount: validation.inconsistentRelationships,
        });
      }

      log.info({ message: `${isDryRun ? 'Dry Run' : 'Applying'} Migration` });

      const migrationResult = await migrateInquiryThreads(isDryRun);

      log.info({
        message: 'Migration Results',
        totalThreadsChecked: migrationResult.totalThreadsChecked,
        threadsWithMissingInquiryId: migrationResult.threadsWithMissingInquiryId,
        threadsWithInquiryResponses: migrationResult.threadsWithInquiryResponses,
        migratedOrWouldMigrate: isDryRun
          ? migrationResult.threadsWithInquiryResponses
          : migrationResult.successfulMigrations,
        skippedThreads: migrationResult.skippedThreads,
      });

      if (migrationResult.errors.length > 0) {
        log.error({
          message: 'Errors encountered during migration',
          errorCount: migrationResult.errors.length,
        });
      }

      if (Object.keys(migrationResult.migrationsByInquiry).length > 0) {
        log.info({
          message: 'Migrations by inquiry',
          migrationsByInquiry: migrationResult.migrationsByInquiry,
        });
      }

      if (!isDryRun && migrationResult.successfulMigrations > 0) {
        log.info({ message: 'Post-Migration Validation' });

        const postValidation = await validateThreadInquiryRelationships();
        log.info({
          message: 'Post-migration validation results',
          remainingThreadsMissingInquiryId:
            postValidation.threadsWithMissingInquiryId,
          threadsFixed:
            validation.threadsWithMissingInquiryId -
            postValidation.threadsWithMissingInquiryId,
        });
      }

      log.info({ message: 'Migration Complete' });

      if (isDryRun) {
        log.info({ message: 'This was a DRY RUN - no changes were made.' });
        if (migrationResult.threadsWithInquiryResponses > 0) {
          log.info({
            message: 'Migration plan ready',
            nextSteps: [
              'Review the migration plan above',
              'Create a database backup',
              'Run with --apply flag to execute the migration',
            ],
          });
        } else {
          log.info({
            message:
              'No migration needed - all threads already have proper inquiryId values.',
          });
        }
      } else {
        log.info({
          message: 'Migration completed successfully',
          threadsUpdated: migrationResult.successfulMigrations,
          nextSteps: [
            'Verify token usage calculations are now accurate',
            'Test inquiry analysis features',
            'Monitor for any issues in production',
          ],
        });

        if (validation.orphanedThreads > 0) {
          log.info({
            message: 'Note: Some threads remain without inquiryId',
            orphanedThreads: validation.orphanedThreads,
            reason:
              'These are likely from agent playground or other non-inquiry contexts. This is expected and normal.',
          });
        }
      }
    }
  } catch (error) {
    log.error({
      message: 'Migration script failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }

  process.exit(0);
})();
