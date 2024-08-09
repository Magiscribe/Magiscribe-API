export default `#graphql
  scalar JSONObject

  enum PredictionType {
    ERROR
    DATA
    SUCCESS
    RECEIVED
  }

  type Prediction {
    id: String!
    subscriptionId: String!
    type: String!
    result: String
  }

  type Mutation {
    addPrediction(
      subscriptionId: String!
      agentId: String!
      variables: JSONObject
      attachments: [JSONObject!]
    ): String
  }

  type Subscription {
    predictionAdded(subscriptionId: String!): Prediction
  }
`;
