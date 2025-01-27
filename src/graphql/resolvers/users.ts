import {
  emailInquiryToUsers,
  getUsersByEmail,
  getUsersById,
  registerUser,
} from '@/controllers/users';
import Context from '@/customTypes/context';
import { User } from '@/database/models/user';
import {
  MutationEmailInquiryToUsersArgs,
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
  },
  Mutation: {
    registerUser: async (_, __, context: Context) => {
      const user = await registerUser({
        sub: context.auth.sub,
      });
      return !!user;
    },

    emailInquiryToUsers: async (_, {userEmails, inquiryId}: MutationEmailInquiryToUsersArgs) => {
      const result = emailInquiryToUsers({userEmails, inquiryId});
      return result;
    }
  },
};
