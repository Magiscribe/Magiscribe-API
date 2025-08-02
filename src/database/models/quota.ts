import mongoose, { Schema } from 'mongoose';

export interface IQuota {
  userId: string;           // Primary key
  allowedTokens: number;    // Default: 10,000,000
  usedTokens: number;       // Aggregated from inquiries
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
  usedTokens: { 
    type: Number, 
    required: true, 
    default: 0 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export const Quota = mongoose.model<IQuota>('Quota', QuotaSchema);
