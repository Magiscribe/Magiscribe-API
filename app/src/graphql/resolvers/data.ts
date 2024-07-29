import {
  createDataObject,
  getDataObject,
  insertIntoDataObject,
  getUserForms,
} from '@controllers/data';
import {
  MutationCreateUpdateDataObjectArgs,
  MutationInsertIntoDataObjectArgs,
  QueryUserFormsArgs,
} from '@generated/graphql';

export default {
  Mutation: {
    createUpdateDataObject: async (
      _parent,
      args: MutationCreateUpdateDataObjectArgs,
    ) => createDataObject(args),
    insertIntoDataObject: async (
      _parent,
      { id, field, value }: MutationInsertIntoDataObjectArgs,
    ) => insertIntoDataObject(id, field, value),
  },
  Query: {
    dataObject: async (_, { id }) => getDataObject(id),
    userForms: async (_, { userId }: QueryUserFormsArgs) =>
      getUserForms(userId),
  },
};
