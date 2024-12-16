import { User } from '@clerk/backend';
import { clerkClient } from '@/utils/clients';
import log from '@/log';

/** Maximum page size for Clerk user list requests */
export const USER_LIST_PAGE_SIZE = 501;

/** Internal user data structure */
export interface UserInternal {
  readonly id: string;
  readonly primaryEmailAddress: string;
  readonly username: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
}

/**
 * Converts a Clerk user to our internal user model
 * @param user - Clerk user object
 * @returns Mapped internal user object
 */
function convertClerkUserToInternalUserModel(user: User): UserInternal {
  return {
    id: user.id,
    primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? '',
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Retrieves users by their IDs
 * @param userIds - Array of user IDs to fetch
 * @throws Error if clerk client fails
 * @returns Array of internal user objects
 */
export async function getUsersById({ userIds }: { userIds: string[] }): Promise<UserInternal[]> {
  if (!userIds.length) return [];

  try {
    const users = await clerkClient.users.getUserList({
      userId: userIds,
      limit: USER_LIST_PAGE_SIZE,
    });

    return users.data.map(convertClerkUserToInternalUserModel);
  } catch (error) {
    log.error({ error, userIds }, 'Failed to fetch users by IDs');
    throw new Error('Failed to fetch users');
  }
}

/**
 * Retrieves a single user by ID
 * @param userId - User ID to fetch
 * @throws Error if clerk client fails
 * @returns User object or null if not found
 */
export async function getUserById({ userId }: { userId: string }): Promise<UserInternal | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user ? convertClerkUserToInternalUserModel(user) : null;
  } catch (error) {
    log.error({ error, userId }, 'Failed to fetch user by ID');
    throw new Error('Failed to fetch user');
  }
}

/**
 * Retrieves users by their email addresses
 * @param userEmails - Array of email addresses to fetch
 * @throws Error if clerk client fails
 * @returns Array of internal user objects
 */
export async function getUsersByEmail({ userEmails }: { userEmails: string[] }): Promise<UserInternal[]> {
  if (!userEmails.length) return [];

  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: userEmails,
      limit: USER_LIST_PAGE_SIZE,
    });

    return users.data.map(convertClerkUserToInternalUserModel);
  } catch (error) {
    log.error({ error, userEmails }, 'Failed to fetch users by emails');
    throw new Error('Failed to fetch users');
  }
}

/**
 * Retrieves a single user by email address
 * @param email - Email address to fetch
 * @throws Error if clerk client fails
 * @returns User object or null if not found
 */
export async function getUserByEmail({ email }: { email: string }): Promise<UserInternal | null> {
  try {
    const users = await getUsersByEmail({ userEmails: [email] });
    return users[0] ?? null;
  } catch (error) {
    log.error({ error, email }, 'Failed to fetch user by email');
    throw new Error('Failed to fetch user');
  }
}