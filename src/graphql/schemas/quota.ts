export default `#graphql
  type Quota {
    userId: ID!
    allowedTokens: Int!
    usedTokens: Int!
    updatedAt: String!
    createdAt: String!
  }

  type Query {
    getUserQuota: Quota @auth
  }

  type Mutation {
    runQuotaUpdate: String @auth
  }
`;
