import { Inquiry as InquiryObject } from '@graphql/codegen';
import mongoose, { Schema } from 'mongoose';

const InquiryResponseSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    data: {
      userDetails: { type: Object, required: false },
      history: [{ type: Object, required: false }],
    },
  },
  { timestamps: true },
);

const InquirySchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    data: {
      form: {
        title: { type: String, required: true },
        description: { type: String, required: false },
        goals: { type: String, required: false },
      },
      graph: { type: Object, required: false },
    },
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
