export default `#graphql
  scalar JSONObject

  enum PredictionType {
    ERROR
    DATA
    SUCCESS
    RECIEVED
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
    ): String
  }

  type Subscription {
    predictionAdded(subscriptionId: String!): Prediction
  }
`;
