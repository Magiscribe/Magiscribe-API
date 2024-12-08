export default `#graphql
  type UserData {
    primaryEmailAddress: String!
    username: String!
    firstName: String
    lastName: String
    id: String!
  }

  type Query {
    getUsersById(userIds: [String!]!): [UserData!]
    getUsersByEmail(userEmails: [String!]!): [UserData]
  } 
`;
