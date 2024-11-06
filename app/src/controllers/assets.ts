import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config';
import { s3Client } from '@utils/clients';
import { uuid } from 'uuidv4';

/**
 * Uploads a media asset to the media assets bucket.
 * @param {string} fileExtension - The extension of the file to upload.
 * @param {string} fileType - The type of the file to upload.
 * @returns {Promise<{ signedUrl: string, uuid: string }>} - The signed URL and UUID of the uploaded asset.
 */
export async function uploadAsset({ userId }: { userId: string }) {
  const fileIdentifier = uuid();
  const s3Key = `${userId}/${fileIdentifier}`;

  const command = new PutObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: s3Key,
  });

  return {
    signedUrl: await getSignedUrl(s3Client, command, { expiresIn: 3600 }),
    uuid: fileIdentifier,
  };
}

export async function getAsset({
  userId,
  uuid,
}: {
  userId: string;
  uuid: string;
}): Promise<string> {
  const s3Key = `${userId}/${uuid}`;

  const command = new GetObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteAsset({
  userId,
  uuid,
}: {
  userId: string;
  uuid: string;
}): Promise<number> {
  const s3Key = `${userId}/${uuid}`;

  const command = new DeleteObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: s3Key,
  });

  return (await s3Client.send(command)).$metadata.httpStatusCode as number;
}
