import {
  upsertInquiry,
  createInquiryResponse,
  deleteInquiry,
  getInquiries,
  getInquiry,
  getInquiryResponses,
  getInquiryResponseCount,
} from '@controllers/inquiry';
import Context from '@customTypes/context';
import {
  MutationDeleteInquiryArgs,
  MutationUpsertInquiryArgs,
  MutationUpsertInquiryResponseArgs,
  QueryGetInquiryArgs,
  QueryGetInquiryResponsesArgs,
  QueryGetInquiryResponseCountArgs,
} from '@generated/graphql';

export default {
  Mutation: {
    upsertInquiry: async (
      _,
      args: MutationUpsertInquiryArgs,
      context: Context,
    ) =>
      upsertInquiry({
        id: args.id ?? undefined,
        userId: context.auth.sub,
        data: args.data,
        fields: args.fields ?? undefined,
      }),

    deleteInquiry: async (
      _,
      args: MutationDeleteInquiryArgs,
      context: Context,
    ) =>
      deleteInquiry({
        id: args.id,
        userId: context.auth.sub,
      }),

    upsertInquiryResponse: async (
      _,
      args: MutationUpsertInquiryResponseArgs,
      context: Context,
    ) => {
      return createInquiryResponse({
        id: args.id,
        inquiryId: args.inquiryId,
        data: args.data,
        userId: context?.auth?.sub,
      });
    },
  },
  Query: {
    getInquiries: async (_, _args, context: Context) =>
      getInquiries(context.auth.sub),

    getInquiry: async (_, args: QueryGetInquiryArgs) => getInquiry(args.id),

    getInquiryResponses: async (_, args: QueryGetInquiryResponsesArgs) =>
      getInquiryResponses(args),

    getInquiryResponseCount: async (
      _,
      args: QueryGetInquiryResponseCountArgs,
      context: Context,
    ) => getInquiryResponseCount(args.id, context.auth.sub),
  },
};
