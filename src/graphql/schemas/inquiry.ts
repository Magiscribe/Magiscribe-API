export default `#graphql
    type Integration {
        id: ID!
        name: String!
        description: String!
        type: String!
        config: JSONObject!
        createdAt: Float!
        updatedAt: Float!
    }

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
        integrations: [ID!]!
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

    type Integration {
        id: ID!
        name: String!
        description: String!
        type: String!
        config: JSONObject!
    }

    input IntegrationInput {
        name: String!
        description: String!
        type: String!
        config: JSONObject!
    }

    type IntegrationConnectionResult {
        success: Boolean!
        error: String
    }

    type Query {
        getInquiries: [Inquiry!] @auth
        getInquiry(id: ID!): Inquiry
        getInquiryResponse(id: ID!): InquiryResponse
        getInquiryResponses(id: ID!, filters: InquiryResponseFilters): [InquiryResponse!] @auth
        getInquiryResponseCount(id: ID!): Int! @auth
        getInquiryTemplates: [JSONObject!]! @auth
        getAverageInquiryResponseTime(id: ID!): AverageInquiryResponseTime! @auth
        getInquiryIntegrations(inquiryId: ID!): [Integration!]! @auth
        
        # MCP Integration testing
        testMCPIntegration(integration: IntegrationInput!): IntegrationConnectionResult! @auth
    }

    type Mutation {
        upsertInquiry(id: ID, data: JSONObject!, fields: [String!]): Inquiry! @auth
        updateInquiryOwners(id: ID!, owners: [String!]!): Inquiry! @auth
        deleteInquiry(id: ID!): Inquiry @auth

        upsertInquiryResponse(id: ID, inquiryId: ID!, subscriptionId: ID! data: JSONObject!, fields: [String!]): InquiryResponse!
        deleteInquiryResponse(id: ID!, inquiryId: ID!): InquiryResponse @auth

        # Integration management for inquiries
        addIntegrationToInquiry(inquiryId: ID!, integrationId: ID!): Inquiry! @auth
        removeIntegrationFromInquiry(inquiryId: ID!, integrationId: ID!): Inquiry! @auth
        setInquiryIntegrations(inquiryId: ID!, integrations: [IntegrationInput!]!): [Integration!]! @auth
    }
`;
