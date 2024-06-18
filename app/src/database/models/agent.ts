import { LLM_MODEL } from '@utils/ai/requests';
import mongoose, { Document, Schema } from 'mongoose';

interface Prompt extends Document {
  id: string;
  name: string;
  text: string;
}

interface Capability {
  id: string;
  name: string;
  description: string;
  llmModel: string;
  prompts: Prompt[];
}

interface Agent {
  id: string;
  alias: string;
  name: string;
  description: string;
  reasoningLLMModel: string;
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
    llmModel: {
      type: String,
      enum: Object.keys(LLM_MODEL),
      default: 'CLAUDE_HAIKU',
    },
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
    reasoningLLMModel: {
      type: String,
      enum: Object.keys(LLM_MODEL),
      default: 'CLAUDE_HAIKU',
    },
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
