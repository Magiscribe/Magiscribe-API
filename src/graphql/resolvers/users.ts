import { checkIfUsersRespondedToInquiry } from '@/controllers/inquiry';
import {
  emailInquiryToUsers,
  getUsersByEmail,
  getUsersById,
  registerUser,
  sendClerkInvite,
} from '@/controllers/users';
import Context from '@/customTypes/context';
import { User } from '@/database/models/user';
import {
  MutationEmailInquiryToUsersArgs,
  MutationSendClerkInviteArgs,
  QueryCheckIfUsersRespondedToInquiryArgs,
  QueryGetUsersByEmailArgs,
  QueryGetUsersByIdArgs,
} from '@/graphql/codegen';

export default {
  Query: {
    getUsersByEmail: async (_, { userEmails }: QueryGetUsersByEmailArgs) =>
      getUsersByEmail({
        userEmails,
      }),

    getUsersById: async (_, { userIds }: QueryGetUsersByIdArgs) =>
      getUsersById({
        userIds,
      }),

    isUserRegistered: async (_, __, context: Context) => {
      const user = await User.findOne({ _id: context.auth.sub });
      return !!user;
    },
    checkIfUsersRespondedToInquiry: async (
      _,
      { userEmails, inquiryId }: QueryCheckIfUsersRespondedToInquiryArgs,
    ) => checkIfUsersRespondedToInquiry(inquiryId, userEmails),
  },
  Mutation: {
    registerUser: async (_, __, context: Context) => {
      const user = await registerUser({
        sub: context.auth.sub,
      });
      return !!user;
    },

    emailInquiryToUsers: async (
      _,
      { userData, inquiryId }: MutationEmailInquiryToUsersArgs,
    ) => {
      const result = emailInquiryToUsers({ userData, inquiryId });
      return result;
    },
    sendClerkInvite: async (
      _,
      { userEmail }: MutationSendClerkInviteArgs,
    ) => {
      const result = sendClerkInvite({ email: userEmail });
      return result;
    },
  },
};
