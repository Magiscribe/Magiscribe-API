import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClerkClient, User } from '@clerk/backend';
import config from '@config';
import log from '@log';
import { s3Client } from '@utils/clients';
import { uuid } from 'uuidv4';

// Max Clerk user list page size is 501: https://clerk.com/docs/references/backend/user/get-user-list
export const USER_LIST_PAGE_SIZE = 501;

// Internal user data model used to only return the required user information.
export interface UserInternal {
  readonly primaryEmailAddress: string | null;
  readonly username: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly id: string;
}

export async function getUsersById({ userIds }: { userIds: string[]}): Promise<UserInternal[]> {
  // Move clerk client to common clients?  Is auth secret key available?
  const clerkClient = createClerkClient({ secretKey: config.auth.secretKey });
  // For now we are assuming that a graph does not have > 501 owners, and will therefore only read the first page.
  const apiResult = await clerkClient.users.getUserList({userId: userIds, limit: USER_LIST_PAGE_SIZE});
  return convertClerkUserToInternalUserModel(apiResult.data);
}

export async function getUsersByEmail({ userEmails }: { userEmails: string[]}): Promise<UserInternal[]> {
  // Move clerk client to common clients?  Is auth secret key available?
  const clerkClient = createClerkClient({ secretKey: config.auth.secretKey });
  // For now we are assuming that a graph does not have > 501 owners, and will therefore only read the first page.
  const apiResult = await clerkClient.users.getUserList({emailAddress: userEmails, limit: USER_LIST_PAGE_SIZE});
  return convertClerkUserToInternalUserModel(apiResult.data);
}

// Only return required user fields to the frontend to avoid exposing any user data unnecessarily
function convertClerkUserToInternalUserModel(users: User[]): UserInternal[] {
  const convertedUserData = users.map((user) => {
    const mappedUserData: UserInternal = {
      primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? "",
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id
    }
    return mappedUserData;
  })
  return convertedUserData;
}

/*
1. Pass in existing graph owner user ids, return list of emails
2. Given an email address (or list of emails), check if a clerk user exists and return the corresponding users

*/

// email -> userId
// userId -> email
