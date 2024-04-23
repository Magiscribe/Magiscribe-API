import mongoose, { Schema } from 'mongoose';

export interface IAsset {
  s3Key: string;
  owners: string[];
}

const AssetSchema = new Schema<IAsset>({
  owners: [{ type: String, required: true }],
  s3Key: { type: String, required: true },
});

export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
