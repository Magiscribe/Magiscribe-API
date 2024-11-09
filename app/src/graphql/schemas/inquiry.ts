export default `#graphql
    type InquiryDataForm {
        title: String!
        goals: String!
        voice: String
    }
    
    type InquiryData {
        form: InquiryDataForm!
        graph: JSONObject
        draftGraph: JSONObject
    }

    type Inquiry {
        id: ID!
        userId: ID!
        data: JSONObject!
        responses: [InquiryResponse!]
        createdAt: Float!
        updatedAt: Float!
    }

    type InquiryResponseData {
        userDetails: JSONObject
        history: [JSONObject!]!
    }

    type InquiryResponse {
        id: ID!
        userId: ID
        data: InquiryResponseData!
        createdAt: Float!
        updatedAt: Float!
    }

    input InquiryResponseFilters {
        startDate: Float       # When to start looking from
        endDate: Float        # When to stop looking
        userName: String      # Filter by name in userDetails
        userEmail: String     # Filter by email in userDetails
    }

    type Query {
        getInquiries: [Inquiry!] @auth
        getInquiry(id: ID!): Inquiry
        getInquiryResponses(id: ID!, filters: InquiryResponseFilters): [InquiryResponse!] @auth
        getInquiryResponseCount(id: ID!, filters: InquiryResponseFilters): Int! @auth
    }

    type Mutation {
        upsertInquiry(id: ID, data: JSONObject!, fields: [String!]): Inquiry! @auth
        deleteInquiry(id: ID!): Inquiry @auth
        upsertInquiryResponse(id: ID, inquiryId: ID!, data: JSONObject!, fields: [String!]): InquiryResponse!
    }
`;
