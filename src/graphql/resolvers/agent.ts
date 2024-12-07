import { Agent, Capability, Collection, Prompt } from '@database/models/agent';
import {
  MutationUpsertCollectionArgs,
  QueryGetAllAgentsArgs,
  QueryGetAllCapabilitiesArgs,
  QueryGetAllPromptsArgs,
} from '@graphql/codegen';
import { LLM_MODELS_VERSION } from '@utils/ai/models';

export default {
  Mutation: {
    upsertPrompt: async (_, { prompt }: { prompt }) => {
      if (!prompt.id) {
        return await Prompt.create(prompt);
      }

      return await Prompt.findOneAndUpdate({ _id: prompt.id }, prompt, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    },
    deletePrompt: async (_, { promptId }: { promptId: string }) => {
      return await Prompt.findOneAndDelete({ _id: promptId });
    },
    upsertCapability: async (_, { capability }: { capability }) => {
      if (!capability.id) {
        return (await Capability.create(capability)).populate('prompts');
      }

      return await Capability.findOneAndUpdate(
        { _id: capability.id },
        capability,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      ).populate('prompts');
    },
    deleteCapability: async (_, { capabilityId }: { capabilityId: string }) => {
      return await Capability.findOneAndDelete({ _id: capabilityId });
    },
    upsertAgent: async (_, { agent }: { agent }) => {
      if (!agent.id) {
        return (await Agent.create(agent)).populate('capabilities');
      }

      return await Agent.findOneAndUpdate(
        {
          _id: agent.id,
        },
        agent,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).populate('capabilities');
    },
    deleteAgent: async (_, { agentId }: { agentId: string }) => {
      return await Agent.findOneAndDelete({ _id: agentId });
    },
    upsertCollection: async (_, args: MutationUpsertCollectionArgs) => {
      if (!args.input.id) {
        return await Collection.create(args.input);
      }

      return await Collection.findOneAndUpdate(
        { _id: args.input.id },
        args.input,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    },
    deleteCollection: async (_, { collectionId }: { collectionId: string }) => {
      // Delete all agents, capabilities, and prompts associated with the collection
      await Promise.all([
        await Agent.deleteMany({ logicalCollection: collectionId }),
        await Capability.deleteMany({ logicalCollection: collectionId }),
        await Prompt.deleteMany({ logicalCollection: collectionId }),
      ]);

      return await Collection.findOneAndDelete({ _id: collectionId });
    },
  },
  Query: {
    getAllModels: async () => {
      return Object.keys(LLM_MODELS_VERSION).map((key) => {
        return {
          id: key,
          name: LLM_MODELS_VERSION[key].name,
          region: LLM_MODELS_VERSION[key].region,
        };
      });
    },
    getPrompt: async (_, { promptId }: { promptId: string }) => {
      return await Prompt.findOne({ _id: promptId }).populate(
        'logicalCollection',
      );
    },
    getAllPrompts: async (_, args: QueryGetAllPromptsArgs) => {
      const query = args.logicalCollection
        ? { logicalCollection: args.logicalCollection }
        : {};
      return await Prompt.find(query).populate('logicalCollection');
    },
    getCapability: async (_, { capabilityId }: { capabilityId: string }) => {
      return Capability.findOne({ _id: capabilityId })
        .populate('prompts')
        .populate('logicalCollection');
    },
    getAllCapabilities: async (_, args: QueryGetAllCapabilitiesArgs) => {
      const query = args.logicalCollection
        ? { logicalCollection: args.logicalCollection }
        : {};
      return await Capability.find(query)
        .populate('prompts')
        .populate('logicalCollection');
    },
    getAgent: async (_, { agentId }: { agentId: string }) => {
      return await Agent.findOne({ _id: agentId }).populate('capabilities');
    },
    getAgentWithPrompts: async (_, { agentId }: { agentId: string }) => {
      return await Agent.findOne({ _id: agentId })
        .populate({
          path: 'capabilities',
          populate: {
            path: 'prompts',
          },
        })
        .populate('logicalCollection');
    },
    getAllAgents: async (_, args: QueryGetAllAgentsArgs) => {
      const query = args.logicalCollection
        ? { logicalCollection: args.logicalCollection }
        : {};
      return await Agent.find(query)
        .populate('capabilities')
        .populate('logicalCollection');
    },
    getCollection: async (_, { collectionId }: { collectionId: string }) => {
      return await Collection.findOne({
        _id: collectionId,
      });
    },
    getAllCollections: async () => {
      return await Collection.find();
    },
  },
};
