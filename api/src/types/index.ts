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
    addPrediction(prompt: String!, context: String): SubscriptionResponse
  }

  type Subscription {
    predictionAdded: Prediction
  }
`;

export default typeDefs;
