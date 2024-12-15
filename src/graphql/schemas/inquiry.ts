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
        userId: [ID!]
        data: InquiryData!
        responses: [InquiryResponse!]
        createdAt: Float!
        updatedAt: Float!
    }

    enum InquiryResponseStatus {
        PENDING
        IN_PROGRESS
        COMPLETED
    }

    type InquiryResponseUserDetails {
        name: String
        email: String
        recieveEmails: Boolean
    }

    type InquiryResponseData {
        status: InquiryResponseStatus!
        userDetails: InquiryResponseUserDetails
        history: [JSONObject!]!
    }

    type InquiryResponse {
        id: ID!
        userId: ID
        data: InquiryResponseData!
        createdAt: Float!
        updatedAt: Float!
    }

    input FloatFilter {
        eq: Float      # Exact match
        gt: Float      # Greater than
        gte: Float     # Greater than or equal
        lt: Float      # Less than
        lte: Float     # Less than or equal
    }

    input StringFilter {
        eq: String         # Exact match
        contains: String   # Contains text (case-insensitive)
        startsWith: String # Starts with text
        endsWith: String   # Ends with text
    }

    input InquiryResponseFilters {
        createdAt: FloatFilter 
        name: StringFilter    
        email: StringFilter   
    }

    type Query {
        getInquiries: [Inquiry!] @auth
        getInquiry(id: ID!): Inquiry
        getInquiryResponses(id: ID!, filters: InquiryResponseFilters): [InquiryResponse!] @auth
        getInquiryResponseCount(id: ID!): Int! @auth
    }

    type Mutation {
        upsertInquiry(id: ID, data: JSONObject!, fields: [String!]): Inquiry! @auth
        updateInquiryOwners(id: ID!, owners: [String!]!): Inquiry! @auth
        deleteInquiry(id: ID!): Inquiry @auth

        upsertInquiryResponse(id: ID, inquiryId: ID!, data: JSONObject!, fields: [String!]): InquiryResponse!
        deleteInquiryResponse(id: ID!, inquiryId: ID!): InquiryResponse @auth
    }
`;
