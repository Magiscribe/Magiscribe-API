export default `#graphql
    type InquirySettingsNotifications {
        recieveEmailOnResponse: Boolean
    }

    type InquirySettings {
        title: String!
        goals: String!
        context: String
        voice: String
        
        notifications: InquirySettingsNotifications
    }
    
    type InquiryData {
        settings: InquirySettings!
        metadata: JSONObject
        graph: JSONObject
        draftGraph: JSONObject
        mcpTools: [JSONObject!]!
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

    type AverageInquiryResponseTime {
        minutes: Float!
        responseCount: Int!
    }

    input InquiryResponseFilters {
        createdAt: FloatFilter 
        name: StringFilter    
        email: StringFilter   
    }

    type Query {
        getInquiries: [Inquiry!] @auth
        getInquiry(id: ID!): Inquiry
        getInquiryResponse(id: ID!): InquiryResponse
        getInquiryResponses(id: ID!, filters: InquiryResponseFilters): [InquiryResponse!] @auth
        getInquiryResponseCount(id: ID!): Int! @auth
        getInquiryTemplates: [JSONObject!]! @auth
        getAverageInquiryResponseTime(id: ID!): AverageInquiryResponseTime! @auth
    }

    type Mutation {
        upsertInquiry(id: ID, data: JSONObject!, fields: [String!]): Inquiry! @auth
        updateInquiryOwners(id: ID!, owners: [String!]!): Inquiry! @auth
        deleteInquiry(id: ID!): Inquiry @auth

        upsertInquiryResponse(id: ID, inquiryId: ID!, subscriptionId: ID! data: JSONObject!, fields: [String!]): InquiryResponse!
        deleteInquiryResponse(id: ID!, inquiryId: ID!): InquiryResponse @auth
    }
`;
