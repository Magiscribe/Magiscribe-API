export default `#graphql
  type DataObject {
    id: String!
    data: JSONObject!
  }

  type Mutation {
    createUpdateDataObject(id: String, data: JSONObject!): DataObject!
    insertIntoDataObject(
      id: String!
      field: String!
      value: JSONObject!
    ): DataObject!
  }

  type Query {
    dataObject(id: String!): DataObject!
  }
`