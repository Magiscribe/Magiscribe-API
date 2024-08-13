export default `#graphql
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

    outputMode: String
    subscriptionFilter: String
    outputFilter: String
  }

  type Capability {
    id: String!
    name: String!
    alias: String!
    llmModel: String!
    description: String!
    prompts: [Prompt]

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
    id: String
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
    id: String!
    name: String!
    description: String!
    reasoning: AgentReasoning

    capabilities: [Capability]!

    memoryEnabled: Boolean!
    subscriptionFilter: String
    outputFilter: String
  }

  type Mutation {
    addUpdatePrompt(prompt: PromptInput!): Prompt @auth(requires: admin)
    deletePrompt(promptId: String!): Prompt @auth(requires: admin)

    addUpdateCapability(capability: CapabilityInput!): Capability
      @auth(requires: admin)
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

    getAgent(agentId: String!): Agent
    getAllAgents: [Agent]
  }
`;
