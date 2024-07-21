import { Schema, model } from 'mongoose';
import { Element as IElement, Frame as IFrame } from '@generated/graphql';

const elementSchema = new Schema({
  elementType: String,
  offsetX: Number,
  offsetY: Number,
  options: Schema.Types.Mixed,
});

const frameSchema = new Schema({
  name: String,
  offsetX: Number,
  offsetY: Number,
  width: Number,
  height: Number,
  startX: Number,
  startY: Number,
  endX: Number,
  endY: Number,
  childElements: [{ type: Schema.ObjectId, ref: 'Element' }],
  childFrames: [{ type: Schema.ObjectId, ref: 'Frame' }],
});

export const Element = model<IElement>('Element', elementSchema);
export const Frame = model<IFrame>('Frame', frameSchema);
