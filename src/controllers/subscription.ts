import { Subscription, ISubscription } from '@/database/models/subscription';
import { randomUUID } from 'crypto';
import log from '@/log';

export type SubscriptionType = 'inquiry_response' | 'graph_edit' | 'per_question_summary' | 'per_response_summary' | 'analysis_chat' | 'agent_playground';

/**
 * Creates a new subscription for a user with auto-generated subscription ID
 * @param userId - The user ID from auth context
 * @param type - The type of subscription being created
 * @param relatedEntityId - Optional related entity ID (like inquiry ID)
 * @returns Promise resolving to the subscription object
 */
export async function createSubscription({
  userId,
  type,
  relatedEntityId,
}: {
  userId: string;
  type: SubscriptionType;
  relatedEntityId?: string;
}): Promise<ISubscription> {
  try {
    // Generate a secure, unique subscription ID
    const subscriptionId = randomUUID();
    
    const subscription = await Subscription.create({
      userId,
      subscriptionId,
      type,
      relatedEntityId,
      isActive: true,
    });

    log.debug({
      msg: 'Created new subscription',
      userId,
      subscriptionId,
      type,
      relatedEntityId,
    });

    return subscription;
  } catch (error) {
    log.error({ error, userId, type }, 'Failed to create subscription');
    throw new Error('Failed to create subscription');
  }
}

/**
 * Validates that a subscription belongs to the authenticated user
 * @param subscriptionId - The subscription ID to validate
 * @param userId - The user ID from auth context
 * @returns Promise resolving to the subscription if valid, null if invalid
 */
export async function validateSubscription({
  subscriptionId,
  userId,
}: {
  subscriptionId: string;
  userId: string;
}): Promise<ISubscription | null> {
  try {
    const subscription = await Subscription.findOne({
      subscriptionId,
      userId,
      isActive: true,
    });

    if (!subscription) {
      log.warn({
        msg: 'Invalid subscription access attempt',
        subscriptionId,
        userId,
      });
      return null;
    }

    return subscription;
  } catch (error) {
    log.error({ error, subscriptionId, userId }, 'Failed to validate subscription');
    return null;
  }
}

/**
 * Deactivates a subscription
 * @param subscriptionId - The subscription ID to deactivate
 * @param userId - The user ID from auth context
 * @returns Promise resolving to boolean indicating success
 */
export async function deactivateSubscription({
  subscriptionId,
  userId,
}: {
  subscriptionId: string;
  userId: string;
}): Promise<boolean> {
  try {
    const result = await Subscription.updateOne(
      { subscriptionId, userId, isActive: true },
      { isActive: false }
    );

    const success = result.modifiedCount > 0;
    
    if (success) {
      log.debug({
        msg: 'Deactivated subscription',
        subscriptionId,
        userId,
      });
    } else {
      log.warn({
        msg: 'Attempted to deactivate non-existent subscription',
        subscriptionId,
        userId,
      });
    }

    return success;
  } catch (error) {
    log.error({ error, subscriptionId, userId }, 'Failed to deactivate subscription');
    return false;
  }
}

/**
 * Gets active subscriptions for a user
 * @param userId - The user ID from auth context
 * @param type - Optional subscription type filter
 * @returns Promise resolving to array of active subscriptions
 */
export async function getUserSubscriptions({
  userId,
  type,
}: {
  userId: string;
  type?: SubscriptionType;
}): Promise<ISubscription[]> {
  try {
    const filter: any = { userId, isActive: true };
    if (type) {
      filter.type = type;
    }

    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 });

    return subscriptions;
  } catch (error) {
    log.error({ error, userId, type }, 'Failed to get user subscriptions');
    throw new Error('Failed to get user subscriptions');
  }
}
