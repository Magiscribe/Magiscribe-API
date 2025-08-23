import {
  addIntegrationToInquiry,
  deleteInquiry,
  deleteInquiryResponse,
  getAverageInquiryResponseTime,
  getInquiries,
  getInquiry,
  getInquiryIntegrations,
  getInquiryResponse,
  getInquiryResponseCount,
  getInquiryResponses,
  getInquiryTemplates,
  removeIntegrationFromInquiry,
  setInquiryIntegrations,
  updateInquiryOwners,
  upsertInquiry,
  upsertInquiryResponse,
} from '@/controllers/inquiry';
import Context from '@/customTypes/context';
import { Integration as IntegrationModel } from '@/database/models/integration';
import {
  Integration,
  MutationAddIntegrationToInquiryArgs,
  MutationDeleteInquiryArgs,
  MutationDeleteInquiryResponseArgs,
  MutationRemoveIntegrationFromInquiryArgs,
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
import {
  listMCPTools,
  Integration as MCPIntegration,
  testMCPConnection,
} from '@/utils/mcpClient';

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

    addIntegrationToInquiry: async (
      _,
      args: MutationAddIntegrationToInquiryArgs,
      context: Context,
    ) =>
      addIntegrationToInquiry(
        args.inquiryId,
        args.integrationId,
        context.auth.sub,
      ),

    removeIntegrationFromInquiry: async (
      _,
      args: MutationRemoveIntegrationFromInquiryArgs,
      context: Context,
    ) =>
      removeIntegrationFromInquiry(
        args.inquiryId,
        args.integrationId,
        context.auth.sub,
      ),

    setInquiryIntegrations: async (
      _,
      args: MutationSetInquiryIntegrationsArgs,
      context: Context,
    ) =>
      setInquiryIntegrations(
        args.inquiryId,
        args.integrations,
        context.auth.sub,
      ),
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

    getInquiryIntegrations: async (_, args: QueryGetInquiryIntegrationsArgs) =>
      getInquiryIntegrations(args.inquiryId),

    testMCPIntegration: async (
      _,
      args: { integration?: Integration; integrationId?: string },
    ) => {
      try {
        let integration: MCPIntegration;

        if (args.integration) {
          // Use the provided integration object directly
          integration = args.integration;
        } else if (args.integrationId) {
          // Get the integration from the database
          const savedIntegration = await IntegrationModel.findById(
            args.integrationId,
          );
          if (!savedIntegration) {
            return {
              success: false,
              tools: [],
              error: 'Integration not found',
            };
          }
          integration = savedIntegration;
        } else {
          return {
            success: false,
            tools: [],
            error:
              'Either integration object or integrationId must be provided',
          };
        }

        // Test the connection
        const connectionSuccess = await testMCPConnection(integration);

        if (!connectionSuccess) {
          return {
            success: false,
            tools: [],
            error: 'Failed to connect to MCP server',
          };
        }

        // If connection is successful, get the available tools
        const tools = await listMCPTools(integration);

        return {
          success: true,
          tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema || null,
          })),
          error: null,
        };
      } catch (error) {
        return {
          success: false,
          tools: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  },
};
