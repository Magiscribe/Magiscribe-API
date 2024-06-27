import { Schema, model } from "mongoose";

export interface IElement {
    elementType: string;
    offsetX: number;
    offsetY: number;
    options: object;
}

export interface IFrame {
    name: string;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    childElements: string[];
    childFrames: string[];
}

const elementSchema = new Schema({
    elementType: String,
    offsetX: Number,
    offsetY: Number,
    options: Schema.Types.Mixed
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
    childFrames: [{ type: Schema.ObjectId, ref: 'Frame' }]
});

export const Element = model<IElement>('Element', elementSchema);
export const Frame = model<IFrame>('Frame', frameSchema);