import {
  createDataObject,
  getDataObject,
  getDataObjectsByUserId,
  insertIntoDataObject,
} from '@controllers/data';
import {
  MutationCreateUpdateDataObjectArgs,
  MutationInsertIntoDataObjectArgs,
} from '@generated/graphql';

export default {
  Mutation: {
    createUpdateDataObject: async (
      _parent,
      args: MutationCreateUpdateDataObjectArgs,
      context,
    ) =>
      createDataObject({
        id: args.id,
        userId: context.auth.sub,
        data: args.data,
      }),
    insertIntoDataObject: async (
      _parent,
      { id, field, value }: MutationInsertIntoDataObjectArgs,
    ) => insertIntoDataObject(id, field, value),
  },
  Query: {
    dataObject: async (_, { id }) => getDataObject(id),
    dataObjectsCreated: async (_parent, _args, context) =>
      getDataObjectsByUserId(context.auth.sub),
  },
};
