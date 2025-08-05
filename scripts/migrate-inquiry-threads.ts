#!/usr/bin/env ts-node
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

import { 
  migrateInquiryThreads, 
  validateThreadInquiryRelationships 
} from '../src/database/migrations/migrate-inquiry-threads';
import database from '../src/database';
import log from '../src/log';

async function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');
  const isDryRun = !shouldApply;

  try {
    console.log('🚀 Starting Inquiry Thread Migration');
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLY CHANGES'}`);
    console.log('=====================================\n');

    // Initialize database connection
    await database.init();
    log.info({ message: 'Database connection established' });

    // Step 1: Validate current state
    console.log('📊 Current State Validation');
    console.log('---------------------------');
    const validation = await validateThreadInquiryRelationships();
    
    console.log(`Total threads: ${validation.totalThreads}`);
    console.log(`Threads with inquiryId: ${validation.threadsWithInquiryId}`);
    console.log(`Threads missing inquiryId: ${validation.threadsWithMissingInquiryId}`);
    console.log(`Threads with InquiryResponses (can be migrated): ${validation.threadsWithInquiryResponses}`);
    console.log(`Orphaned threads (no InquiryResponse): ${validation.orphanedThreads}`);
    
    if (validation.inconsistentRelationships.length > 0) {
      console.log('\n⚠️  Inconsistent relationships found:');
      validation.inconsistentRelationships.forEach(rel => console.log(`  - ${rel}`));
    }

    // Step 2: Run migration
    console.log(`\n🔄 ${isDryRun ? 'Dry Run' : 'Applying'} Migration`);
    console.log('---------------------------');
    
    const migrationResult = await migrateInquiryThreads(isDryRun);
    
    console.log(`\n📈 Migration Results:`);
    console.log(`Total threads checked: ${migrationResult.totalThreadsChecked}`);
    console.log(`Threads with missing inquiryId: ${migrationResult.threadsWithMissingInquiryId}`);
    console.log(`Threads with InquiryResponses: ${migrationResult.threadsWithInquiryResponses}`);
    console.log(`${isDryRun ? 'Would migrate' : 'Successfully migrated'}: ${isDryRun ? migrationResult.threadsWithInquiryResponses : migrationResult.successfulMigrations}`);
    console.log(`Skipped threads: ${migrationResult.skippedThreads}`);
    
    if (migrationResult.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      migrationResult.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Step 3: Final validation (if changes were applied)
    if (!isDryRun && migrationResult.successfulMigrations > 0) {
      console.log('\n🔍 Post-Migration Validation');
      console.log('----------------------------');
      
      const postValidation = await validateThreadInquiryRelationships();
      console.log(`Remaining threads missing inquiryId: ${postValidation.threadsWithMissingInquiryId}`);
      console.log(`Migration reduced missing inquiryId threads by: ${validation.threadsWithMissingInquiryId - postValidation.threadsWithMissingInquiryId}`);
    }

    // Step 4: Summary and next steps
    console.log('\n✅ Migration Complete');
    console.log('====================');
    
    if (isDryRun) {
      console.log('This was a DRY RUN - no changes were made.');
      if (migrationResult.threadsWithInquiryResponses > 0) {
        console.log(`\n📋 Next Steps:`);
        console.log(`1. Review the migration plan above`);
        console.log(`2. Create a database backup`);
        console.log(`3. Run with --apply flag to execute the migration:`);
        console.log(`   npm run migrate:inquiry-threads --apply`);
      } else {
        console.log('\n🎉 No migration needed - all threads already have proper inquiryId values.');
      }
    } else {
      console.log(`✨ Successfully migrated ${migrationResult.successfulMigrations} threads!`);
      console.log('\n📋 Recommended Next Steps:');
      console.log('1. Verify token usage calculations are now accurate');
      console.log('2. Test inquiry analysis features');
      console.log('3. Monitor for any issues in production');
      
      if (validation.orphanedThreads > 0) {
        console.log(`\n📝 Note: ${validation.orphanedThreads} threads remain without inquiryId.`);
        console.log('These are likely from agent playground or other non-inquiry contexts.');
        console.log('This is expected and normal.');
      }
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    log.error({
      message: 'Migration script failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the migration
main();
