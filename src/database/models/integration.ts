import mongoose, { Schema } from 'mongoose';

const IntegrationSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['MCP'], required: true },
    config: { type: Object, required: true },
    userId: { type: String, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Integration = mongoose.model('Integration', IntegrationSchema);
