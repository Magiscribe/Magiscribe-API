export default `#graphql
    type Inquiry {
        id: ID!
        userId: ID!
        data: JSONObject!
        responses: [InquiryResponse!]
        createdAt: String!
        updatedAt: String!
    }

    type InquiryResponse {
        id: ID!
        userId: ID
        data: [JSONObject!]!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        getInquiries: [Inquiry] @auth
        getInquiry(id: ID!): Inquiry
        getInquiryResponses(id: ID!): [InquiryResponse] @auth
    }

    type Mutation {
        upsertInquiry(id: ID, data: JSONObject!): Inquiry @auth
        deleteInquiry(id: ID!): Inquiry @auth
        upsertInquiryResponse(id: ID, inquiryId: ID, data: [JSONObject!]!): InquiryResponse
    }
`;
