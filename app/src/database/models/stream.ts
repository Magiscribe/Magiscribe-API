import mongoose, { Schema } from 'mongoose';

export interface IStream {
  id: string;
  subscriptionId: string;
  data: Record<string, unknown>;
}

const StreamSchema: Schema = new mongoose.Schema(
  {
    subscriptionId: { type: String, required: true },
    data: { type: Object, required: true },
  },
  { timestamps: true },
);

export const Stream = mongoose.model<IStream>('Stream', StreamSchema);
