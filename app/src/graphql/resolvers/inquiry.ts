import {
  MutationDeleteInquiryArgs,
  MutationUpsertInquiryArgs,
  MutationUpsertInquiryResponseArgs,
  QueryGetInquiryArgs,
  QueryGetInquiryResponsesArgs,
} from '@generated/graphql';
import { Context } from '@customTypes/context';
import {
  createInquiry,
  createInquiryResponse,
  deleteInquiry,
  getInquiries,
  getInquiry,
  getInquiryResponses,
} from '@controllers/inquiry';

export default {
  Mutation: {
    upsertInquiry: async (
      _parent,
      args: MutationUpsertInquiryArgs,
      context: Context,
    ) =>
      createInquiry({
        id: args.id,
        userId: context.auth.sub,
        data: args.data,
      }),

    deleteInquiry: async (
      _parent,
      args: MutationDeleteInquiryArgs,
      context: Context,
    ) =>
      deleteInquiry({
        id: args.id,
        userId: context.auth.sub,
      }),

    upsertInquiryResponse: async (
      _parent,
      args: MutationUpsertInquiryResponseArgs,
      context: Context,
    ) => {
      return createInquiryResponse({
        id: args.id,
        inquiryId: args.inquiryId,
        data: args.data,
        userId: context.auth.sub,
      });
    },
  },
  Query: {
    getInquiries: async (_parent, _args, context: Context) =>
      getInquiries(context.auth.sub),

    getInquiry: async (_parent, args: QueryGetInquiryArgs) =>
      getInquiry(args.id),

    getInquiryResponses: async (_parent, args: QueryGetInquiryResponsesArgs) =>
      getInquiryResponses(args),
  },
};
