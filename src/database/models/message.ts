import mongoose, { Schema } from 'mongoose';

export enum MessageResponseTypes {
  Text = 'text',
  Command = 'command',
  Error = 'error',
}

export interface IThread {
  subscriptionId: string;
  inquiryId?: string;
  messages: IMessage[];
}

interface IMessage {
  userId?: string;
  agentId?: string;
  response: IMessageResponse;
}

interface IMessageResponse {
  type: MessageResponseTypes;
  response: string;
  model?: string;
  tokens?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

const ThreadSchema = new Schema<IThread>({
  subscriptionId: String,
  inquiryId: { type: String, required: false },
  messages: [
    {
      userId: String,
      agentId: String,
      response: {
        type: {
          type: String,
          enum: ['text', 'command', 'error'],
        },
        response: { type: Object, required: true },
      },
      model: { type: String, required: false },
      tokens: {
        type: {
          inputTokens: Number,
          outputTokens: Number,
          totalTokens: Number,
        },
        required: false,
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export const Thread = mongoose.model<IThread>('Thread', ThreadSchema);
