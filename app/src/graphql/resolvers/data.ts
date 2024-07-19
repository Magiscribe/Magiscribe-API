import {
  createDataObject,
  getDataObject,
  insertIntoDataObject,
} from '@controllers/data';
import { GraphQLJSONObject } from 'graphql-type-json';

export const DataModule ={
  JSONObject: GraphQLJSONObject,
  Mutation: {
    createUpdateDataObject: async (_parent, args) => createDataObject(args),
    insertIntoDataObject: async (_parent, { id, field, value }) =>
      insertIntoDataObject(id, field, value),
  },
  Query: {
    dataObject: async (_, { id }) => getDataObject(id),
  },
};
