import { LLM_MODELS_VERSION } from '@utils/ai/models';
import mongoose, { Schema } from 'mongoose';

export interface IPrompt {
  id: string;
  name: string;
  text: string;
}

export interface ICapability {
  id: string;
  name: string;
  description: string;
  llmModel: string;
  prompts: IPrompt[];
  outputMode: string;
}

export interface IAgent {
  id: string;
  alias: string;
  name: string;
  description: string;
  reasoningLLMModel: string;
  reasoningPrompt: string;
  capabilities: ICapability[];
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
      enum: Object.keys(LLM_MODELS_VERSION),
      default: 'CLAUDE_3_HAIKU',
    },
    description: { type: String, required: true },
    prompts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt',
      },
    ],
    outputMode: {
      type: String,
      enum: [
        'SYNCHRONOUS_PASSTHROUGH_AGGREGATE', // The AI response is given with all other aggregated responses.
        'SYNCHRONOUS_PASSTHROUGH_INVIDUAL', // The AI response is sent when after a response is recieved.

        'SYNCHRONOUS_EXECUTION_AGGREGATE', // The AI response is given with all other aggregated responses, after passing through a code execution step.
        'SYNCHRONOUS_EXECUTION_INVIDUAL', // The AI response is sent when after a response is recieved, after passing through a code execution step.

        'STREAMING_INDIVIDUAL', // The AI response is streamed to the client as it is recieved.
      ],
      default: 'SYNCHRONOUS_EXECUTION_AGGREGATE',
    },
  },
  { timestamps: true },
);

const agentSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    reasoningLLMModel: {
      type: String,
      enum: Object.keys(LLM_MODELS_VERSION),
      default: 'CLAUDE_3_HAIKU',
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

export const Prompt = mongoose.model<IPrompt>('Prompt', PromptSchema);
export const Capability = mongoose.model<ICapability>(
  'Capability',
  CapabilitySchema,
);
export const Agent = mongoose.model<IAgent>('Agent', agentSchema);
