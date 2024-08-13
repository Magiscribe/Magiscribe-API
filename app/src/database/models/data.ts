import { DataObject } from '@generated/graphql';
import mongoose, { Schema } from 'mongoose';

const DataSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    data: { type: Object, required: true },
  },
  { timestamps: true },
);

export const Data = mongoose.model<DataObject>('Data', DataSchema);
