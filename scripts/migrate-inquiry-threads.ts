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
  validateThreadInquiryRelationships,
} from '../src/database/migrations/migrate-inquiry-threads';
import database from '../src/database';
import log from '../src/log';

async function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');
  const isDryRun = !shouldApply;

  try {
    log.info({ message: 'Starting Inquiry Thread Migration' });
    log.info({ message: `Mode: ${isDryRun ? 'DRY RUN' : 'APPLY CHANGES'}` });

    // Initialize database connection
    await database.init();
    log.info({ message: 'Database connection established' });

    // Step 1: Validate current state
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

    if (validation.inconsistentRelationships.length > 0) {
      log.warn({
        message: 'Inconsistent relationships found',
        inconsistentRelationships: validation.inconsistentRelationships,
      });
    }

    // Step 2: Run migration
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
        errors: migrationResult.errors,
      });
    }

    // Step 3: Final validation (if changes were applied)
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

    // Step 4: Summary and next steps
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
  } catch (error) {
    log.error({
      message: 'Migration script failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  log.error({
    message: 'Unhandled Rejection',
    reason: reason,
    promise: promise,
  });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log.error({
    message: 'Uncaught Exception',
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Run the migration
main();
