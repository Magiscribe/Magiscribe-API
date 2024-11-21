import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config';
import { Asset } from '@database/models/image';
import log from '@log';
import { s3Client } from '@utils/clients';
import { uuid } from 'uuidv4';

/**
 * Uploads a media asset to the media assets bucket.
 * @param {string} fileExtension - The extension of the file to upload.
 * @param {string} fileType - The type of the file to upload.
 * @returns {Promise<{ signedUrl: string, uuid: string }>} - The signed URL and UUID of the uploaded asset.
 */
export async function uploadAsset({ userId }: { userId: string }) {
  const s3Key = `uploads/${uuid()}`;
  // Store the image s3Key to owner mapping in MongoDB
  const result = await Asset.create({ owners: [userId], s3Key });

  const command = new PutObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: s3Key,
  });

  return {
    signedUrl: await getSignedUrl(s3Client, command, { expiresIn: 3600 }),
    id: result.id,
  };
}

export async function getAsset({ id }: { id: string }): Promise<string> {
  const result = await Asset.findOne({ _id: id });

  const command = new GetObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: result?.s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteAsset({
  userId,
  id,
}: {
  userId: string;
  id: string;
}): Promise<number> {
  const result = await Asset.findOne({ _id: id });

  if (result?.owners.find((owner) => owner === userId)) {
    const command = new DeleteObjectCommand({
      Bucket: config.mediaAssetsBucketName,
      Key: result?.s3Key,
    });

    const deleteResult = await Asset.deleteOne({ _id: id });

    if (deleteResult.deletedCount === 0) {
      log.warn({
        message: `Image object with id ${id} not found`,
        id,
      });
      throw new Error(`Image object with id ${id} not found`);
    }

    return (await s3Client.send(command)).$metadata.httpStatusCode as number;
  } else {
    // A user can only delete images they own.
    return 401;
  }
}
