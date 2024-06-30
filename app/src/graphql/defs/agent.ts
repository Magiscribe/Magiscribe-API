import { Agent, Capability, Prompt } from '@database/models/agent';
import { StaticGraphQLModule } from '@graphql';
import { LLM_MODELS_VERSION } from '@utils/ai/models';

export const AgentModule: StaticGraphQLModule = {
  schema: `#graphql
    type Model {
      id: String!
      name: String!
      region: String!
    }

    input PromptInput {
      id: String
      name: String!
      text: String!
    }

    type Prompt {
      id: String!
      name: String!
      text: String!
    }

    input CapabilityInput {
      id: String
      name: String!
      alias: String!
      llmModel: String
      description: String!
      prompts: [String]
    }

    type Capability {
      id: String!
      name: String!
      alias: String!
      llmModel: String
      description: String!
      prompts: [Prompt]
    }

    input AgentInput {
      id: String
      name: String!
      description: String!
      reasoningLLMModel: String
      reasoningPrompt: String
      capabilities: [String]
    }

    type Agent {
      id: String!
      name: String!
      description: String!
      reasoningLLMModel: String
      reasoningPrompt: String
      capabilities: [Capability]
    }   

    type Mutation {
      addUpdatePrompt(prompt: PromptInput!): Prompt @auth(requires: admin)
      deletePrompt(promptId: String!): Prompt @auth(requires: admin)

      addUpdateCapability(capability: CapabilityInput!): Capability @auth(requires: admin)
      deleteCapability(capabilityId: String!): Capability @auth(requires: admin)

      addUpdateAgent(agent: AgentInput!): Agent @auth(requires: admin)
      deleteAgent(agentId: String!): Agent @auth(requires: admin)
    }

    type Query {
      getAllModels: [Model] @auth(requires: admin)

      getPrompt(promptId: String!): Prompt @auth(requires: admin)
      getAllPrompts: [Prompt] @auth(requires: admin)

      getCapability(capabilityId: String!): Capability @auth(requires: admin)
      getAllCapabilities: [Capability] @auth(requires: admin)

      getAgent(agentId: String!): Agent @auth(requires: admin)
      getAllAgents: [Agent] @auth(requires: admin)
    }
  `,

  resolvers: {
    Mutation: {
      addUpdatePrompt: async (_, { prompt }: { prompt }) => {
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
      addUpdateCapability: async (_, { capability }: { capability }) => {
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
      deleteCapability: async (
        _,
        { capabilityId }: { capabilityId: string },
      ) => {
        return await Capability.findOneAndDelete({ _id: capabilityId });
      },
      addUpdateAgent: async (_, { agent }: { agent }) => {
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
      getAllAgents: async () => {
        return await Agent.find().populate('capabilities');
      },
    },
  },
};

export default AgentModule;
