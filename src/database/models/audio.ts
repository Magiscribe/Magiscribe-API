import mongoose, { Schema } from 'mongoose';

export interface IAudio {
  text: string;
  voiceId: string;
  s3Key: string;
  expiresAt?: Date;
}

const AudioSchema = new Schema<IAudio>({
  text: { type: String, required: true },
  voiceId: { type: String, required: true },
  s3Key: { type: String, required: true },
  expiresAt: {
    type: Date,
    required: true,
    default: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
  },
});

// Auto delete expired audio files
AudioSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Audio = mongoose.model<IAudio>('Audio', AudioSchema);
