import {
  deleteInquiry,
  deleteInquiryResponse,
  getInquiries,
  getInquiry,
  getInquiryResponse,
  getInquiryResponseCount,
  getInquiryResponses,
  upsertInquiry,
  upsertInquiryResponse,
} from '@/controllers/inquiry';
import Context from '@/customTypes/context';
import {
  MutationDeleteInquiryArgs,
  MutationDeleteInquiryResponseArgs,
  MutationUpsertInquiryArgs,
  MutationUpsertInquiryResponseArgs,
  QueryGetInquiryArgs,
  QueryGetInquiryResponseArgs,
  QueryGetInquiryResponseCountArgs,
  QueryGetInquiryResponsesArgs,
} from '@/graphql/codegen';

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
      return upsertInquiryResponse({
        id: args.id ?? undefined,
        inquiryId: args.inquiryId,
        data: args.data,
        fields: args.fields ?? undefined,
        userId: context?.auth?.sub,
      });
    },
    deleteInquiryResponse: async (
      _,
      args: MutationDeleteInquiryResponseArgs,
      context: Context,
    ) =>
      deleteInquiryResponse({
        id: args.id,
        inquiryId: args.inquiryId,
        userId: context.auth.sub,
      }),
  },
  Query: {
    getInquiries: async (_, _args, context: Context) =>
      getInquiries(context.auth.sub),

    getInquiry: async (_, args: QueryGetInquiryArgs) => getInquiry(args.id),

    getInquiryResponse: async (_, args: QueryGetInquiryResponseArgs) =>
      getInquiryResponse(args),
    getInquiryResponses: async (_, args: QueryGetInquiryResponsesArgs) =>
      getInquiryResponses(args),

    getInquiryResponseCount: async (
      _,
      args: QueryGetInquiryResponseCountArgs,
      context: Context,
    ) => getInquiryResponseCount(args.id, context.auth.sub),
  },
};
