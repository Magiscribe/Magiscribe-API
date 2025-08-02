import { Inquiry } from '@/database/models/inquiry';
import { Thread } from '@/database/models/message';
import { Quota, IQuota } from '@/database/models/quota';

/**
 * Calculates the total token usage for a specific user across all inquiries they have access to.
 * 
 * @param userId - The ID of the user to calculate token usage for
 * @returns Promise<number> - Total token usage across all user's inquiries
 */
export async function calculateUserTokenUsage(userId: string): Promise<number> {
  try {
    // Step 1: Find all inquiries where userId is present in the userId array
    const userInquiries = await Inquiry.find({ 
      userId: { $in: [userId] } 
    });

    if (userInquiries.length === 0) {
      return 0; // User has no inquiries
    }

    // Step 2: Get inquiry IDs
    const inquiryIds = userInquiries.map(inquiry => inquiry.id);

    // Step 3: Find threads for those inquiries
    const threads = await Thread.find({ 
      inquiryId: { $in: inquiryIds } 
    });

    // Step 4: Sum tokens from all messages in all threads
    const totalTokens = threads.reduce((sum, thread) => {
      if (!thread.messages || !Array.isArray(thread.messages)) {
        return sum;
      }
      
      return sum + thread.messages.reduce((messageSum, message) => {
        // Tokens are stored directly on the message, not in message.response
        return messageSum + (message.tokens?.totalTokens || 0);
      }, 0);
    }, 0);

    return totalTokens;

  } catch (error) {
    console.error(`Error calculating token usage for user ${userId}:`, error);
    throw new Error(`Failed to calculate token usage for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const totalTokenUsage = await calculateUserTokenUsage(userId);

    // Step 2: Find or create quota record for user (with 10M default if new)
    const updatedQuota = await Quota.findOneAndUpdate(
      { userId }, // Find by userId
      { 
        usedTokens: totalTokenUsage,
        // Only set allowedTokens if creating new record
        $setOnInsert: { allowedTokens: 10000000 }
      },
      { 
        upsert: true,  // Create if doesn't exist
        new: true,     // Return updated document
        runValidators: true
      }
    );

    console.log(`Updated quota for user ${userId}: ${totalTokenUsage} tokens used`);
    return updatedQuota;

  } catch (error) {
    console.error(`Error updating quota for user ${userId}:`, error);
    throw new Error(`Failed to update quota for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates quota records for all users who have inquiries.
 * Processes users in parallel for better performance.
 */
export async function updateAllUserQuotas(): Promise<void> {
  try {
    console.log('Starting batch quota update for all users...');

    // Step 1: Get all unique userIds from inquiry userId arrays
    const uniqueUserIds = await Inquiry.distinct('userId');
    
    // Filter out null/undefined values
    const validUserIds = uniqueUserIds.filter((userId): userId is string => 
      userId != null && typeof userId === 'string'
    );
    
    if (validUserIds.length === 0) {
      console.log('No valid users found in inquiries, skipping quota update');
      return;
    }

    console.log(`Processing ${validUserIds.length} users in parallel...`);

    // Step 2: Process all users in parallel
    await Promise.allSettled(
      validUserIds.map(async (userId) => {
        try {
          await updateUserQuota(userId);
        } catch (error) {
          console.error(`Failed to update quota for user ${userId}:`, error);
          // Individual failures don't stop the batch
        }
      })
    );

    console.log(`Batch quota update completed for ${validUserIds.length} users`);

  } catch (error) {
    console.error(`Batch quota update failed:`, error);
    throw new Error(`Batch quota update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}