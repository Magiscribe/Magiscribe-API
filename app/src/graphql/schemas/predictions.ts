export default `#graphql
  scalar JSONObject

  enum PredictionType {
    ERROR
    DATA
    SUCCESS
    RECEIVED
  }

  type Prediction {
    id: ID!
    subscriptionId: ID!
    type: String!
    result: String
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
