const typeDefs = `#graphql
  type Prediction {
    prompt: String
    context: String
    result: String
  }

  type Query {
    predictions: [Prediction]
  }

  type Mutation {
    addPrediction(prompt: String!, context: String): Prediction
  }
`;

export default typeDefs;