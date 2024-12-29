import {
  getUsersByEmail,
  getUsersById,
  registerUser,
} from '@/controllers/users';
import Context from '@/customTypes/context';
import { User } from '@/database/models/user';
import {
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
      const user = await User.findOne({ sub: context.auth.sub });
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
  },
};
