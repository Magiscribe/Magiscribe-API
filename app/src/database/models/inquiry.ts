import { Inquiry as InquiryObject } from '@generated/graphql';
import mongoose, { Schema } from 'mongoose';

const InquiryResponseSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    data: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      organizationName: { type: String, required: false },
      organizationRole: { type: String, required: false },
      inputGoals: { type: String, required: false },
    },
  },
  { timestamps: true },
);

const InquirySchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    data: [{ type: Object, required: true }],
    responses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InquiryResponse',
      },
    ],
  },
  { timestamps: true },
);

export const Inquiry = mongoose.model<InquiryObject>('Inquiry', InquirySchema);
export const InquiryResponse = mongoose.model<InquiryObject>(
  'InquiryResponse',
  InquiryResponseSchema,
);
