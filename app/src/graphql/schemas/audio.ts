export default `#graphql
  type TemporaryCredentials {
    accessKeyId: String!
    secretAccessKey: String!
    sessionToken: String!
  }

  type Mutation {
    generateTranscriptionStreamingCredentials: TemporaryCredentials
    generateAudio(voice: String!, text: String!): String @auth
  }
`;
