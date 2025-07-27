import {
  deleteInquiry,
  deleteInquiryResponse,
  executeInquiryIntegrationTool,
  getAverageInquiryResponseTime,
  getInquiries,
  getInquiry,
  getInquiryIntegrations,
  getInquiryResponse,
  getInquiryResponseCount,
  getInquiryResponses,
  getInquiryTemplates,
  getIntegrationTools,
  setInquiryIntegrations,
  testIntegrationConnection,
  updateInquiryOwners,
  upsertInquiry,
  upsertInquiryResponse,
} from '@/controllers/inquiry';
import Context from '@/customTypes/context';
import {
  MutationDeleteInquiryArgs,
  MutationDeleteInquiryResponseArgs,
  MutationExecuteInquiryIntegrationToolArgs,
  MutationSetInquiryIntegrationsArgs,
  MutationUpdateInquiryOwnersArgs,
  MutationUpsertInquiryArgs,
  MutationUpsertInquiryResponseArgs,
  QueryGetInquiryArgs,
  QueryGetInquiryIntegrationsArgs,
  QueryGetInquiryResponseArgs,
  QueryGetInquiryResponseCountArgs,
  QueryGetInquiryResponsesArgs,
} from '@/graphql/codegen';

export default {
  Mutation: {
    updateInquiryOwners: async (
      _,
      args: MutationUpdateInquiryOwnersArgs,
      context: Context,
    ) =>
      updateInquiryOwners({
        id: args.id ?? undefined,
        userId: context.auth.sub,
        owners: args.owners,
      }),

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
        subscriptionId: args.subscriptionId,
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

    setInquiryIntegrations: async (
      _,
      args: MutationSetInquiryIntegrationsArgs,
      context: Context,
    ) => {
      return setInquiryIntegrations(args.inquiryId, args.integrations);
    },

    executeInquiryIntegrationTool: async (
      _,
      args: MutationExecuteInquiryIntegrationToolArgs,
      context: Context,
    ) => {
      return executeInquiryIntegrationTool(args.inquiryId, args.toolName, args.args);
    },
  },
  Query: {
    getInquiries: async (_, _args, context: Context) =>
      getInquiries(context.auth.sub),

    getInquiry: async (_, args: QueryGetInquiryArgs) => getInquiry(args.id),

    getInquiryResponse: async (_, args: QueryGetInquiryResponseArgs) =>
      getInquiryResponse(args),
    getInquiryResponses: async (_, args: QueryGetInquiryResponsesArgs) =>
      getInquiryResponses(args),
    getAverageInquiryResponseTime: async (_, args: { id: string }) =>
      getAverageInquiryResponseTime(args.id),
    getInquiryResponseCount: async (
      _,
      args: QueryGetInquiryResponseCountArgs,
      context: Context,
    ) => getInquiryResponseCount(args.id, context.auth.sub),

    getInquiryTemplates: () => getInquiryTemplates(),

    getInquiryIntegrations: async (
      _,
      args: QueryGetInquiryIntegrationsArgs,
      context: Context,
    ) => {
      return getInquiryIntegrations(args.inquiryId);
    },
  },
};
