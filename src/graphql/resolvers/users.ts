import { getUsersByEmail, getUsersById } from '@controllers/users';
import {
  QueryGetUsersByEmailArgs,
  QueryGetUsersByIdArgs,
} from '@graphql/codegen';

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
  },
};
