export default `#graphql
  type Mutation {
    addMediaAsset(fileType: String!, fileName: String!): String @auth
  }
`;
