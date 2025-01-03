import {
  Inquiry as InquiryObject,
  InquiryResponse as InquiryResponseObject,
} from '@/graphql/codegen';
import mongoose, { Schema } from 'mongoose';

const InquiryResponseSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, ref: 'User', required: false },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
    },
    data: {
      status: {
        type: String,
        required: true,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      },
      userDetails: {
        name: { type: String, required: false },
        email: { type: String, required: false },
        recieveEmails: { type: Boolean, required: false },
      },
    },
  },
  { timestamps: true },
);

const InquirySchema: Schema = new mongoose.Schema(
  {
    userId: [{ type: String, ref: 'User', required: true }],
    data: {
      settings: {
        title: { type: String, required: true },
        goals: { type: String, required: false },
        context: { type: String, required: false },
        voice: { type: String, required: false },
        notifications: {
          recieveEmailOnResponse: { type: Boolean, required: false },
        },
      },
      metadata: {
        images: { type: Object, required: false },
        text: { type: String, require: false },
      },
      graph: { type: Object, required: false },
      draftGraph: { type: Object, required: false },
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

// A pre-hook to delete all responses when an inquiry is deleted so that orphaned responses are not left behind.
InquirySchema.pre(
  'deleteOne',
  { document: false, query: true },
  async function () {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await InquiryResponse.deleteMany({ _id: { $in: doc.responses } });
    }
  },
);

// A hook to remove the reference to the response when a response is deleted.
InquiryResponseSchema.pre(
  'deleteOne',
  { document: false, query: true },
  async function () {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await Inquiry.updateMany(
        { responses: doc._id },
        { $pull: { responses: doc._id } },
      );
    }
  },
);

export const Inquiry = mongoose.model<InquiryObject>('Inquiry', InquirySchema);
export const InquiryResponse = mongoose.model<InquiryResponseObject>(
  'InquiryResponse',
  InquiryResponseSchema,
);
