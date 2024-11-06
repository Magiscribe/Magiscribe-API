export default `#graphql
  type AddMediaAssetResponse {
    signedUrl: String!
    uuid: String!
  }

  type Query {
    getMediaAsset(uuid: String!): String @auth
  } 

  type Mutation {
    addMediaAsset: AddMediaAssetResponse @auth
    deleteMediaAsset(uuid: String!): Int @auth
  }
`;
