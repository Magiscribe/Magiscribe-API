export default `#graphql
  type Voice {
    id: String!
    name: String!
    tags: [String!]!
  }

  type Query {
    getAllAudioVoices: [Voice!]!
  }

  type Mutation {
    generateAudio(voice: String!, text: String!): String
  }
`;
