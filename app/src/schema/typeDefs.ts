const typeDefs = `#graphql
  type Prediction {
    prompt: String
    context: String
    result: String
  }

  type SubscriptionResponse {
    message: String
  }

  type AddMediaAssetResponse {
    message: String
    url: String
  }

  type Query {
    hello: String
  }

  type Mutation {
    addVisualPrediction(prompt: String!, context: String): SubscriptionResponse
    addTextPrediction(prompt: String!): SubscriptionResponse

    addMediaAsset(fileType: String!, fileName: String!): AddMediaAssetResponse
    transcribeAudio(fileName: String!): String
  }

  type Subscription {
    visualPredictionAdded(whiteBoardId: String!): Prediction
    textPredictionAdded: Prediction
  }
`;

export default typeDefs;
