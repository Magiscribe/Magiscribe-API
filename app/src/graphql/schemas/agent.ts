export default `#graphql
  type Model {
    id: ID!
    name: String!
    region: String!
  }

  input CollectionInput {
    id: ID
    name: String!
  }

  type Collection {
    id: ID!
    name: String!
  }

  input PromptInput {
    id: ID
    name: String!
    logicalCollection: String!
    text: String!
  }

  type Prompt {
    id: ID!
    name: String!
    logicalCollection: Collection!
    text: String!
  }

  input CapabilityInput {
    id: ID
    name: String!
    logicalCollection: String!
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
    logicalCollection: Collection!
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
    logicalCollection: String!
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
    logicalCollection: Collection!
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

    upsertCollection(input: CollectionInput!): Collection @auth(requires: admin)
    deleteCollection(collectionId: ID!): Collection @auth(requires: admin)
  }

  type Query {
    getAllModels: [Model!]! @auth(requires: admin)

    getPrompt(promptId: ID!): Prompt @auth(requires: admin)
    getAllPrompts(logicalCollection: String): [Prompt] @auth(requires: admin)

    getCapability(capabilityId: ID!): Capability @auth(requires: admin)
    getAllCapabilities(logicalCollection: String): [Capability!]! @auth(requires: admin)

    getAgent(agentId: ID!): Agent
    getAgentWithPrompts(agentId: ID!): Agent
    getAllAgents(logicalCollection: String): [Agent!]!

    getCollection(collectionId: ID!): Collection @auth(requires: admin)
    getAllCollections: [Collection!]! @auth(requires: admin)
  }
`;
