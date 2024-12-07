export default `#graphql
  type AddMediaAssetResponse {
    signedUrl: String!
    id: String!
  }

  type Query {
    getMediaAsset(id: String!): String
  } 

  type Mutation {
    addMediaAsset: AddMediaAssetResponse @auth
    deleteMediaAsset(id: String!): Int @auth
  }
`;
