import mongoose from 'mongoose';

enum SubscriptionTypes {
  Free = 'free',
  Basic = 'basic',
  Premium = 'premium',
  Enterprise = 'enterprise',
}

interface IUser {
  stripeCustomerId: string;
  subscription: {
    type: SubscriptionTypes;
    expiresAt: Date;
  }
}

const userSchema = new mongoose.Schema(
  // We alias the _id field to sub.
  {
    _id: {
      type: String,
      alias: 'sub',
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    subscription: {
      type: {
        type: String,
        enum: Object.values(SubscriptionTypes),
        required: true,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model('User', userSchema);
