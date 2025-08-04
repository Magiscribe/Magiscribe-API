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
    correlationId: String
    tokenUsage: TokenUsage
  }

  type AddPredictionResponse {
    status: String!
    correlationId: String!
  }

  type Mutation {
    addPrediction(
      subscriptionId: ID!
      agentId: ID!
      inquiryId: ID
      variables: JSONObject
      attachments: [JSONObject!]
      inquiryId: ID
      integrationId: ID
    ): AddPredictionResponse!
  }

  type Subscription {
    predictionAdded(subscriptionId: ID!): Prediction
  }
`;
