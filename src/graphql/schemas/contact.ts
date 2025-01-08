export default `#graphql
  input ContactInput {
    name: String!
    email: String!
    message: String!
  }

  type ContactResponse {
    success: Boolean!
    messageId: String
  }

  type Mutation {
    contact(input: ContactInput!): ContactResponse!
  }
`;
