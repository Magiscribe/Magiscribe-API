import {
  createInquiry,
  createInquiryResponse,
  deleteInquiry,
  getInquiries,
  getInquiry,
  getInquiryResponses,
} from '@controllers/inquiry';
import Context from '@customTypes/context';
import {
  MutationDeleteInquiryArgs,
  MutationUpsertInquiryArgs,
  MutationUpsertInquiryResponseArgs,
  QueryGetInquiryArgs,
  QueryGetInquiryResponsesArgs,
} from '@generated/graphql';

export default {
  Mutation: {
    upsertInquiry: async (
      _,
      args: MutationUpsertInquiryArgs,
      context: Context,
    ) =>
      createInquiry({
        id: args.id,
        userId: context.auth.sub,
        data: args.data,
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
  },
};
