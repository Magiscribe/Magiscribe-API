import mongoose, { Document, Schema } from 'mongoose';

interface Prompt extends Document {
  id: string;
  name: string;
  text: string;
}

interface Capability extends Document {
  id: string;
  name: string;
  description: string;
  prompts: Prompt[];
}

interface Agent extends Document {
  id: string;
  alias: string;
  name: string;
  description: string;
  aiModel: string;
  reasoningPrompt: string;
  capabilities: Capability[];
}

const PromptSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const CapabilitySchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    alias: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    prompts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt',
      },
    ],
  },
  { timestamps: true },
);

const agentSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    reasoningPrompt: { type: String },
    capabilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Capability',
      },
    ],
  },
  { timestamps: true },
);

export const Prompt = mongoose.model<Prompt>('Prompt', PromptSchema);
export const Capability = mongoose.model<Capability>(
  'Capability',
  CapabilitySchema,
);
export const Agent = mongoose.model<Agent>('Agent', agentSchema);
