import { Agent, Capability } from '@database/models/agent';
import { StaticGraphQLModule } from '@graphql';

export const AgentModule: StaticGraphQLModule = {
  schema: `#graphql
    union Capability = Capability

    input CapabilityInput {
      id: String
      name: String!
      description: String!
      prompt: String!
    }

    type Capability {
      id: String!
      name: String!
      description: String!
      prompt: String!
    }

    input AgentInput {
      id: String
      alias: String!
      name: String!
      description: String!
      aiModel: String
      capabilities: [String]
    }

    type Agent {
      id: String!
      alias: String!
      name: String!
      description: String!
      aiModel: String
      capabilities: [Capability]
    }   

    type Mutation {
      addUpdateCapability(capability: CapabilityInput!): Capability @auth(requires: admin)
      deleteCapability(capabilityId: String!): Capability @auth(requires: admin)

      addUpdateAgent(agent: AgentInput!): Agent @auth(requires: admin)
      deleteAgent(agentId: String!): Agent @auth(requires: admin)
    }

    type Query {
      getCapability(capabilityId: String!): Capability @auth(requires: admin)
      getAllCapabilities: [Capability] @auth(requires: admin)

      getAgent(agentId: String!): Agent @auth(requires: admin)
      getAllAgents: [Agent] @auth(requires: admin)
    }
  `,

  resolvers: {
    Mutation: {
      addUpdateCapability: async (_, { capability }: { capability }) => {
        if (!capability.id) {
          return await Capability.create(capability);
        }

        return await Capability.findOneAndUpdate(
          { _id: capability.id },
          capability,
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      },
      deleteCapability: async (
        _,
        { capabilityId }: { capabilityId: string },
      ) => {
        return await Capability.findOneAndDelete({ _id: capabilityId });
      },
      addUpdateAgent: async (_, { agent }: { agent }) => {
        if (!agent.id) {
          return await Agent.create(agent);
        }

        return await Agent.findOneAndUpdate(
          {
            _id: agent.id,
          },
          agent,
          { upsert: true, new: true },
        ).populate('capabilities');
      },
      deleteAgent: async (_, { agentId }: { agentId: string }) => {
        return await Agent.findOneAndDelete({ _id: agentId });
      },
    },
    Query: {
      getCapability: async (_, { capabilityId }: { capabilityId: string }) => {
        return Capability.findOne({ _id: capabilityId });
      },
      getAllCapabilities: async () => {
        return await Capability.find();
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
