import { Inquiry } from '@/database/models/inquiry';
import { Thread } from '@/database/models/message';
import { Quota, IQuota } from '@/database/models/quota';
import log from '@/log';

/**
 * Calculates the total token usage for a specific user across all inquiries they have access to.
 *
 * @param userId - The ID of the user to calculate token usage for
 * @returns Promise<{totalTokens: number, inputTokens: number, outputTokens: number}> - Token usage breakdown
 */
export async function calculateUserTokenUsage(userId: string): Promise<{
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}> {
  try {
    // Step 1: Find all inquiries where userId is present in the userId array
    const userInquiries = await Inquiry.find({
      userId: { $in: [userId] },
    });

    if (userInquiries.length === 0) {
      return { totalTokens: 0, inputTokens: 0, outputTokens: 0 }; // User has no inquiries
    }

    // Step 2: Get inquiry IDs
    const inquiryIds = userInquiries.map((inquiry) => inquiry.id);

    // Step 3: Find threads for those inquiries
    const threads = await Thread.find({
      inquiryId: { $in: inquiryIds },
    });

    // Step 4: Sum tokens from all messages in all threads
    const tokenTotals = threads.reduce(
      (totals, thread) => {
        if (!thread.messages || !Array.isArray(thread.messages)) {
          return totals;
        }

        const threadTotals = thread.messages.reduce(
          (messageTotals, message) => {
            const tokens = message.tokens;
            return {
              totalTokens:
                messageTotals.totalTokens + (tokens?.totalTokens || 0),
              inputTokens:
                messageTotals.inputTokens + (tokens?.inputTokens || 0),
              outputTokens:
                messageTotals.outputTokens + (tokens?.outputTokens || 0),
            };
          },
          { totalTokens: 0, inputTokens: 0, outputTokens: 0 },
        );

        return {
          totalTokens: totals.totalTokens + threadTotals.totalTokens,
          inputTokens: totals.inputTokens + threadTotals.inputTokens,
          outputTokens: totals.outputTokens + threadTotals.outputTokens,
        };
      },
      { totalTokens: 0, inputTokens: 0, outputTokens: 0 },
    );

    return tokenTotals;
  } catch (error) {
    log.error({ error, userId }, `Error calculating token usage for user ${userId}`);
    throw new Error(
      `Failed to calculate token usage for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Updates the quota record for a specific user with their current token usage.
 * Creates a new quota record if one doesn't exist.
 *
 * @param userId - The ID of the user to update quota for
 * @returns Promise<IQuota> - The updated quota object
 */
export async function updateUserQuota(userId: string): Promise<IQuota> {
  try {
    // Step 1: Calculate total token usage for the user
    const tokenUsage = await calculateUserTokenUsage(userId);

    // Step 2: Find or create quota record for user (with 10M default if new)
    const updatedQuota = await Quota.findOneAndUpdate(
      { userId }, // Find by userId
      {
        usedTotalTokens: tokenUsage.totalTokens,
        usedInputTokens: tokenUsage.inputTokens,
        usedOutputTokens: tokenUsage.outputTokens,
        updatedAt: new Date(), // Explicitly set updatedAt
        // Only set allowedTokens if creating new record
        $setOnInsert: { allowedTokens: 10000000 },
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return updated document
        runValidators: true,
      },
    );

    log.info(
      `Updated quota for user ${userId}: ${tokenUsage.totalTokens} total tokens used (${tokenUsage.inputTokens} input, ${tokenUsage.outputTokens} output)`,
    );
    return updatedQuota;
  } catch (error) {
    log.error({ error, userId }, `Error updating quota for user ${userId}`);
    throw new Error(
      `Failed to update quota for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Updates quota records for all users who have inquiries.
 * Processes users in parallel for better performance.
 */
export async function updateAllUserQuotas(): Promise<void> {
  try {
    log.info('Starting batch quota update for all users...');

    // Step 1: Get all unique userIds from inquiry userId arrays
    const uniqueUserIds = await Inquiry.distinct('userId');

    // Filter out null/undefined values
    const validUserIds = uniqueUserIds.filter(
      (userId): userId is string =>
        userId != null && typeof userId === 'string',
    );

    if (validUserIds.length === 0) {
      log.info('No valid users found in inquiries, skipping quota update');
      return;
    }

    log.info(`Processing ${validUserIds.length} users in parallel...`);

    // Step 2: Process all users in parallel
    await Promise.allSettled(
      validUserIds.map(async (userId) => {
        try {
          await updateUserQuota(userId);
        } catch (error) {
          console.error(`Failed to update quota for user ${userId}:`, error);
          // Individual failures don't stop the batch
        }
      }),
    );

    log.info(`Batch quota update completed for ${validUserIds.length} users`);
  } catch (error) {
    log.error({ error }, 'Batch quota update failed');
    throw new Error(
      `Batch quota update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
