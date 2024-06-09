import mongoose, { Document, Schema } from 'mongoose';

interface Capability extends Document {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

interface Agent extends Document {
  id: string;
  alias: string;
  name: string;
  description: string;
  aiModel: string;
  capabilities: Capability[];
}

const CapabilitySchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
);

const agentSchema: Schema = new mongoose.Schema(
  {
    alias: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    aiModel: { type: String },
    capabilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Capability',
      },
    ],
  },
  { timestamps: true },
);

export const Capability = mongoose.model<Capability>(
  'Capability',
  CapabilitySchema,
);
export const Agent = mongoose.model<Agent>('Agent', agentSchema);
