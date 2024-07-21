import { DataObject } from '@generated/graphql';
import mongoose, { Schema } from 'mongoose';

const DataSchema: Schema = new mongoose.Schema(
  {
    data: { type: Object, required: true },
  },
  { timestamps: true },
);

export const Data = mongoose.model<DataObject>('Data', DataSchema);
