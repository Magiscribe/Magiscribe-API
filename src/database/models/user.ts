import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  // We alias the _id field to sub.
  {
    _id: {
      type: String,
      alias: 'sub',
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model('User', userSchema);
