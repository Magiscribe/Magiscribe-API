export default `#graphql
  type Quota {
    userId: ID!
    allowedTokens: Int!
    usedTotalTokens: Int!
    usedInputTokens: Int!
    usedOutputTokens: Int!
    updatedAt: String!
    createdAt: String!
  }

  type Query {
    getUserQuota: Quota @auth
  }
`;
