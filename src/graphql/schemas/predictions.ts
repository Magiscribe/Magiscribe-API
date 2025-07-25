export default `#graphql
  scalar JSONObject

  enum PredictionType {
    ERROR
    DATA
    SUCCESS
    RECEIVED
  }

  type TokenUsage {
    inputTokens: Int!
    outputTokens: Int!
    totalTokens: Int!
  }

  type Prediction {
    id: ID!
    subscriptionId: ID!
    type: PredictionType!
    result: String
    tokenUsage: TokenUsage
  }

  type Mutation {
    addPrediction(
      subscriptionId: ID!
      agentId: ID!
      variables: JSONObject
      attachments: [JSONObject!]
    ): String
  }

  type Subscription {
    predictionAdded(subscriptionId: ID!): Prediction
  }
`;
