const schema = `#graphql
  type Prediction {
    prompt: String
    context: String
    result: String
  }

  type TemporaryCredentials {
    accessKeyId: String
    secretAccessKey: String
    sessionToken: String
  }

  type Query {
    hello: String
  }

  type Mutation {
    addVisualPrediction(
      subscriptionId: String!
      prompt: String!
      context: String
    ): String
    addTextPrediction(subscriptionId: String!, prompt: String!): String

    addMediaAsset(fileType: String!, fileName: String!): String
  }

  type Subscription {
    visualPredictionAdded(subscriptionId: String!): Prediction
    textPredictionAdded(subscriptionId: String!): Prediction
  }
`;

export default schema;
