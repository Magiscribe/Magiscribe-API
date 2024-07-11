import mongoose, { Schema } from 'mongoose';

export interface IStream {
  id: string;
  subscriptionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const StreamSchema: Schema = new mongoose.Schema(
  {
    subscriptionId: { type: String, required: true },
    data: { type: Object, required: true },
  },
  { timestamps: true },
);

export const Stream = mongoose.model<IStream>('Stream', StreamSchema);
