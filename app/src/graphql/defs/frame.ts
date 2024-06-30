import { Element, Frame } from "@database/models/frame";
import { StaticGraphQLModule } from "@graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export const FrameModule: StaticGraphQLModule = {
    schema: `#graphql
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
    `,
    resolvers: {
        JSONObject: GraphQLJSONObject,
        Query: {
            async getFrame(_, { frameId }) {
                return await Frame.findById(frameId).populate(['childElements', 'childFrames']);
            },
            async getElement(_, { elementId }) {
                return await Element.findById(elementId);
            }
        },
        Mutation: {
            async createFrame(_, { frame }) {
                return await Frame.create(frame);
            },
            async updateFrame(_, { frameId, frame }) {
                return await Frame.findByIdAndUpdate(frameId, frame, {
                    new: true
                }).populate(['childElements', 'childFrames']);
            },
            async addChildFrames(_, { frameId, childFrameIds }) {
                const frame = await Frame.findById(frameId);
                frame?.childFrames.push(...childFrameIds);
                await frame?.save();
                return await frame?.populate(['childElements', 'childFrames']);
            },
            async addChildElements(_, { frameId, childElementIds }) {
                const frame = await Frame.findById(frameId);
                frame?.childElements.push(...childElementIds);
                await frame?.save();
                return await frame?.populate(['childElements', 'childFrames']);
            },
            async deleteFrame(_, { frameId }) {
                return await Frame.findByIdAndDelete(frameId);
            },

            async createElement(_, { element }) {
                return await Element.create(element);
            },
            async updateElement(_, { elementId, element }) {
                return await Element.findByIdAndUpdate(elementId, element, {
                    new: true
                });
            },
            async deleteElement(_, { elementId }) {
                return await Element.findByIdAndDelete(elementId);
            }
        }
    }
}

export default FrameModule;