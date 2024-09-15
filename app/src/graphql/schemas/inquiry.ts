export default `#graphql
    type Inquiry {
        id: ID!
        userId: ID!
        data: JSONObject!
        responses: [InquiryResponse!]
        createdAt: Float!
        updatedAt: Float!
    }

    type InquiryResponse {
        id: ID!
        userId: ID
        data: [JSONObject!]!
        createdAt: Float!
        updatedAt: Float!
    }

    type Query {
        getInquiries: [Inquiry!] @auth
        getInquiry(id: ID!): Inquiry
        getInquiryResponses(id: ID!): [InquiryResponse!] @auth
        getInquiryResponseCount(id: ID!): Int! @auth
    }

    type Mutation {
        upsertInquiry(id: ID, data: JSONObject!, fields: [String!]): Inquiry! @auth
        deleteInquiry(id: ID!): Inquiry @auth
        upsertInquiryResponse(id: ID, inquiryId: ID!, data: [JSONObject!]!): InquiryResponse!
    }
`;
