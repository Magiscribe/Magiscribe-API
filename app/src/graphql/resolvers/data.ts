import {
  createDataObject,
  getDataObject,
  insertIntoDataObject,
} from '@controllers/data';
import { MutationCreateUpdateDataObjectArgs, MutationInsertIntoDataObjectArgs } from '@generated/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

export default {
  Mutation: {
    createUpdateDataObject: async (_parent, args: MutationCreateUpdateDataObjectArgs) => createDataObject(args),
    insertIntoDataObject: async (_parent, { id, field, value }: MutationInsertIntoDataObjectArgs) =>
      insertIntoDataObject(id, field, value),
  },
  Query: {
    dataObject: async (_, { id }) => getDataObject(id),
  },
};
