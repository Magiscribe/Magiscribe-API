const typeDefs = `#graphql
  type Prediction {
    prompt: String
    context: String
    result: String
  }

  type SubscriptionResponse {
    message: String
  }

  type Query {
    hello: String
  }

  type Mutation {
    addVisualPrediction(prompt: String!, context: String): SubscriptionResponse
    addTextPrediction(prompt: String!): SubscriptionResponse
  }

  type Subscription {
    visualPredictionAdded: Prediction
    textPredictionAdded: Prediction
  }
`;

export default typeDefs;
