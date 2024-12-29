import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    sub: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model('User', userSchema);
