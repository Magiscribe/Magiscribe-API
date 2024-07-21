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
    getFrame(frameId: String!): Frame
    getElement(elementId: String!): Element
  }

  type Mutation {
    createFrame(frame: FrameCreateInput!): Frame
    updateFrame(frameId: String!, frame: FrameUpdateInput!): Frame
    addChildFrames(frameId: String!, childFrameIds: [String!]!): Frame
    addChildElements(frameId: String!, childElementIds: [String!]!): Frame
    deleteFrame(frameId: String!): Frame

    createElement(element: ElementCreateInput!): Element
    updateElement(elementId: String!, element: ElementUpdateInput!): Element
    deleteElement(elementId: String!): Element
  }
`;