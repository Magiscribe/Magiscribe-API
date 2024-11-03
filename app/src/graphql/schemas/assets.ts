export default `#graphql
  type Mutation {
    addMediaAsset(s3Key: String!): String @auth
    getMediaAsset(s3Key: String!): String @auth
    deleteMediaAsset(s3Key: String!): Int
  }
`;
