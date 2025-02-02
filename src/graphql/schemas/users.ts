export default `#graphql
  type UserData {
    primaryEmailAddress: String!
    username: String
    firstName: String
    lastName: String
    id: String!
  }

  input UserDataInput {
    primaryEmailAddress: String!
    username: String
    firstName: String
    lastName: String
    id: String
    lastContacted: String
  }

  type Query {
    getUsersById(userIds: [String!]!): [UserData!]
    getUsersByEmail(userEmails: [String!]!): [UserData]
    isUserRegistered: Boolean!
  }

  type Mutation {
    registerUser: Boolean! @auth
    emailInquiryToUsers(userData: [UserDataInput!]!, inquiryId: String!): String
  }
`;
