import {
  Agent as IAgent,
  Capability as ICapability,
  Prompt as IPrompt,
} from '@generated/graphql';
import { LLM_MODELS_VERSION } from '@utils/ai/models';
import mongoose, { Schema } from 'mongoose';

export enum OutputReturnMode {
  SYNCHRONOUS_PASSTHROUGH_AGGREGATE = 'SYNCHRONOUS_PASSTHROUGH_AGGREGATE', // The AI response is given with all other aggregated responses.
  SYNCHRONOUS_PASSTHROUGH_INVIDUAL = 'SYNCHRONOUS_PASSTHROUGH_INVIDUAL', // The AI response is sent when after a response is recieved.
  SYNCHRONOUS_EXECUTION_AGGREGATE = 'SYNCHRONOUS_EXECUTION_AGGREGATE', // The AI response is given with all other aggregated responses, after passing through a code execution step.
  SYNCHRONOUS_EXECUTION_INVIDUAL = 'SYNCHRONOUS_EXECUTION_INVIDUAL', // The AI response is sent when after a response is recieved, after passing through a code execution step.
  STREAMING_INDIVIDUAL = 'STREAMING_INDIVIDUAL', // The AI response is streamed to the client as it is recieved.
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
      default: LLM_MODELS_VERSION.CLAUDE_3_HAIKU.id,
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
      enum: Object.values(OutputReturnMode),
      default: 'SYNCHRONOUS_EXECUTION_AGGREGATE',
    },
    subscriptionFilter: { type: String },
    outputFilter: { type: String },
  },
  { timestamps: true },
);

const agentSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    reasoning: {
      type: {
        llmModel: {
          type: String,
          enum: Object.keys(LLM_MODELS_VERSION),
          default: LLM_MODELS_VERSION.CLAUDE_3_HAIKU.id,
        },
        prompt: { type: String },
        variablePassThrough: { type: Boolean, default: false },
      },
    },
    capabilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Capability',
      },
    ],
    memoryEnabled: {
      type: Boolean,
      default: false,
    },
    subscriptionFilter: { type: String },
    outputFilter: { type: String },
  },
  { timestamps: true },
);

export const Prompt = mongoose.model<IPrompt>('Prompt', PromptSchema);
export const Capability = mongoose.model<ICapability>(
  'Capability',
  CapabilitySchema,
);
export const Agent = mongoose.model<IAgent>('Agent', agentSchema);
