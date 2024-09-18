export default `#graphql
  type Model {
    id: ID!
    name: String!
    region: String!
  }

  input PromptInput {
    id: ID
    name: String!
    text: String!
  }

  type Prompt {
    id: ID!
    name: String!
    text: String!
  }

  input CapabilityInput {
    id: ID
    name: String!
    alias: String!
    llmModel: String
    description: String!
    prompts: [String]

    outputMode: String
    subscriptionFilter: String
    outputFilter: String
  }

  type Capability {
    id: ID!
    name: String!
    alias: String!
    llmModel: String!
    description: String!
    prompts: [Prompt!]!

    outputMode: String!
    subscriptionFilter: String
    outputFilter: String
  }

  input AgentReasoningInput {
    llmModel: String!
    prompt: String!
    variablePassThrough: Boolean!
  }

  input AgentInput {
    id: ID
    name: String!
    description: String!
    reasoning: AgentReasoningInput

    capabilities: [String]!

    memoryEnabled: Boolean
    subscriptionFilter: String
    outputFilter: String
  }

  type AgentReasoning {
    llmModel: String!
    prompt: String!
    variablePassThrough: Boolean!
  }

  type Agent {
    id: ID!
    name: String!
    description: String!
    reasoning: AgentReasoning

    capabilities: [Capability!]!

    memoryEnabled: Boolean!
    subscriptionFilter: String
    outputFilter: String
  }

  type Mutation {
    upsertPrompt(prompt: PromptInput!): Prompt @auth(requires: admin)
    deletePrompt(promptId: ID!): Prompt @auth(requires: admin)

    upsertCapability(capability: CapabilityInput!): Capability
      @auth(requires: admin)
    deleteCapability(capabilityId: ID!): Capability @auth(requires: admin)

    upsertAgent(agent: AgentInput!): Agent @auth(requires: admin)
    deleteAgent(agentId: ID!): Agent @auth(requires: admin)
  }

  type Query {
    getAllModels: [Model!]! @auth(requires: admin)

    getPrompt(promptId: ID!): Prompt @auth(requires: admin)
    getAllPrompts: [Prompt] @auth(requires: admin)

    getCapability(capabilityId: ID!): Capability @auth(requires: admin)
    getAllCapabilities: [Capability!]! @auth(requires: admin)

    getAgent(agentId: ID!): Agent
    getAgentWithPrompts(agentId: ID!): Agent
    getAllAgents: [Agent!]!
  }
`;
