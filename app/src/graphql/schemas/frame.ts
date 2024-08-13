export default `#graphql
  scalar JSONObject
  type Element {
    _id: String!
    elementType: String!
    offsetX: Float!
    offsetY: Float!
    options: JSONObject!
  }
  type Frame {
    _id: String!
    name: String!
    offsetX: Float!
    offsetY: Float!
    width: Float!
    height: Float!
    startX: Float!
    startY: Float!
    endX: Float!
    endY: Float!
    childFrames: [Frame!]!
    childElements: [Element!]!
  }

  input ElementCreateInput {
    elementType: String!
    offsetX: Float!
    offsetY: Float!
    options: JSONObject!
  }

  input ElementUpdateInput {
    elementType: String
    offsetX: Float
    offsetY: Float
    options: JSONObject
  }

  input FrameCreateInput {
    name: String!
    offsetX: Float!
    offsetY: Float!
    width: Float!
    height: Float!
    startX: Float!
    startY: Float!
    endX: Float!
    endY: Float!
  }

  input FrameUpdateInput {
    name: String
    offsetX: Float
    offsetY: Float
    width: Float
    height: Float
    startX: Float
    startY: Float
    endX: Float
    endY: Float
  }

  type Query {
    getFrame(frameId: String!): Frame @auth
    getElement(elementId: String!): Element @auth
  }

  type Mutation {
    createFrame(frame: FrameCreateInput!): Frame @auth
    updateFrame(frameId: String!, frame: FrameUpdateInput!): Frame @auth
    addChildFrames(frameId: String!, childFrameIds: [String!]!): Frame @auth
    addChildElements(frameId: String!, childElementIds: [String!]!): Frame @auth
    deleteFrame(frameId: String!): Frame @auth

    createElement(element: ElementCreateInput!): Element @auth
    updateElement(elementId: String!, element: ElementUpdateInput!): Element @auth
    deleteElement(elementId: String!): Element @auth
  }
`;
