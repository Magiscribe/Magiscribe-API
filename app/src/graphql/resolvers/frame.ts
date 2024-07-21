import { Element, Frame } from '@database/models/frame';
import { GraphQLJSONObject } from 'graphql-type-json';

export default {
  JSONObject: GraphQLJSONObject,
  Query: {
    async getFrame(_, { frameId }) {
      return await Frame.findById(frameId).populate([
        'childElements',
        'childFrames',
      ]);
    },
    async getElement(_, { elementId }) {
      return await Element.findById(elementId);
    },
  },
  Mutation: {
    async createFrame(_, { frame }) {
      return await Frame.create(frame);
    },
    async updateFrame(_, { frameId, frame }) {
      return await Frame.findByIdAndUpdate(frameId, frame, {
        new: true,
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
        new: true,
      });
    },
    async deleteElement(_, { elementId }) {
      return await Element.findByIdAndDelete(elementId);
    },
  },
};
