import { Agent, Capability, Prompt } from '@database/models/agent';

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
      return await Prompt.findOne({ _id: promptId });
    },
    getAllPrompts: async () => {
      return await Prompt.find();
    },
    getCapability: async (_, { capabilityId }: { capabilityId: string }) => {
      return Capability.findOne({ _id: capabilityId }).populate('prompts');
    },
    getAllCapabilities: async () => {
      return await Capability.find().populate('prompts');
    },
    getAgent: async (_, { agentId }: { agentId: string }) => {
      return await Agent.findOne({ _id: agentId }).populate('capabilities');
    },
    getAgentWithPrompts: async (_, { agentId }: { agentId: string }) => {
      return await Agent.findOne({ _id: agentId }).populate({
        path: 'capabilities',
        populate: {
          path: 'prompts',
        },
      });
    },
    getAllAgents: async () => {
      return await Agent.find().populate('capabilities');
    },
  },
};
