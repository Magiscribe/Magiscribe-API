import templateBranchInquiry from '@/assets/templates/demo';
import { Inquiry } from '@/database/models/inquiry';
import { User } from '@/database/models/user';
import log from '@/log';
import { clerkClient } from '@/utils/clients';
import { sendInquiryToUsers, sendWelcomeEmail } from '@/utils/emails/types';
import { User as ClerkUser } from '@clerk/backend';
import { UserDataInput } from '@/graphql/codegen';

/** Maximum page size for Clerk user list requests */
export const USER_LIST_PAGE_SIZE = 501;

/** Internal user data structure */
export interface UserInternal {
  readonly id: string;
  readonly primaryEmailAddress?: string;
  readonly phone?: string;
  readonly username?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
}

/**
 * Converts a Clerk user to our internal user model
 * @param user - Clerk user object
 * @returns Mapped internal user object
 */
function convertClerkUserToInternalUserModel(user: ClerkUser): UserInternal {
  return {
    id: user.id,
    primaryEmailAddress: user.primaryEmailAddress?.emailAddress,
    phone: user.primaryPhoneNumber?.phoneNumber,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function emailInquiryToUsers({
  userData,
  inquiryId,
}: {
  userData: UserDataInput[];
  inquiryId: string;
}): Promise<string> {
  try {
    await sendInquiryToUsers({ userData, inquiryId });
    return 'Success';
  } catch (error) {
    log.error({ error }, 'Failed to send email with error');
    return `Failed to send email to users`;
  }
}

/**
 * Retrieves users by their IDs
 * @param userIds - Array of user IDs to fetch
 * @throws Error if clerk client fails
 * @returns Array of internal user objects
 */
export async function getUsersById({
  userIds,
}: {
  userIds: string[];
}): Promise<UserInternal[]> {
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

export async function sendClerkInvite({
  email,})
: Promise<string> {
  try {
    const result = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      ignoreExisting: true,
      notify: true,
    });
    log.info({ result, email }, 'Clerk invite sent successfully');
    return "Success";
  } catch (error) {
    log.error({ error, email }, 'Failed to send Clerk invite');
    throw new Error('Failed to send Clerk invite');
  }
}

/**
 * Retrieves a single user by ID
 * @param userId - User ID to fetch
 * @throws Error if clerk client fails
 * @returns User object or null if not found
 */
export async function getUserById({
  sub,
}: {
  sub: string;
}): Promise<UserInternal | null> {
  try {
    const user = await clerkClient.users.getUser(sub);
    if (!user) return null;

    return convertClerkUserToInternalUserModel(user);
  } catch (error) {
    log.error({ error, userId: sub }, 'Failed to fetch user by ID');
    throw new Error('Failed to fetch user');
  }
}

/**
 * Retrieves users by their email addresses
 * @param userEmails - Array of email addresses to fetch
 * @throws Error if clerk client fails
 * @returns Array of internal user objects
 */
export async function getUsersByEmail({
  userEmails,
}: {
  userEmails: string[];
}): Promise<UserInternal[]> {
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
export async function getUserByEmail({
  email,
}: {
  email: string;
}): Promise<UserInternal | null> {
  try {
    const users = await getUsersByEmail({ userEmails: [email] });
    const user = users[0] ?? null;

    return user;
  } catch (error) {
    log.error({ error, email }, 'Failed to fetch user by email');
    throw new Error('Failed to fetch user');
  }
}

/**
 * Registers a new user in the system
 * @param sub - User's subject ID from auth
 * @param sendWelcome - Whether to send welcome email
 * @returns True if registration was successful
 */
export async function registerUser({ sub }: { sub: string }): Promise<boolean> {
  try {
    const clerkUser = await getUserById({ sub });
    if (!clerkUser) {
      throw new Error('User not found in Clerk');
    }

    // Create user in our database
    const user = await User.findOneAndUpdate(
      { _id: sub },
      { _id: sub },
      { upsert: true, new: true },
    );

    // Add default inquiry to user
    await Inquiry.create({
      data: templateBranchInquiry.data,
      userId: [user._id],
    });

    if (clerkUser.primaryEmailAddress) {
      await sendWelcomeEmail({
        recipientEmails: [clerkUser.primaryEmailAddress],
        firstName: clerkUser.firstName,
      });
    }

    return true;
  } catch (error) {
    log.error({ error, sub }, 'Failed to register user');
    throw new Error('Failed to register user');
  }
}
