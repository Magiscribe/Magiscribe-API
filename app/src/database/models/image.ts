import mongoose, { Schema } from 'mongoose';

export interface IImage {
  s3Key: string;
  owners: string[];
}

const ImageSchema = new Schema<IImage>({
  owners: [{ type: String, required: true}],
  s3Key: { type: String, required: true },
});

export const Image = mongoose.model<IImage>('Image', ImageSchema);
