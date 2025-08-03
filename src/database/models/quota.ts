import mongoose, { Schema } from 'mongoose';

export interface IQuota {
  userId: string;           // Primary key
  allowedTokens: number;    // Default: 10,000,000
  usedTotalTokens: number;  // Aggregated from inquiries
  usedInputTokens: number;  // Aggregated input tokens
  usedOutputTokens: number; // Aggregated output tokens
  createdAt?: Date;         // Timestamp field
  updatedAt?: Date;         // Timestamp field
}

const QuotaSchema = new Schema<IQuota>({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  allowedTokens: { 
    type: Number, 
    required: true, 
    default: 10000000 
  },
  usedTotalTokens: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  usedInputTokens: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  usedOutputTokens: { 
    type: Number, 
    required: true, 
    default: 0 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export const Quota = mongoose.model<IQuota>('Quota', QuotaSchema);
