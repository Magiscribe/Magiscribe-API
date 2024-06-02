import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config';
import { s3Client } from '@utils/clients';
import { uuid } from 'uuidv4';

/**
 * Uploads a media asset to the media assets bucket.
 * @param {string} fileExtension - The extension of the file to upload.
 * @param {string} fileType - The type of the file to upload.
 * @returns {Promise<string>} The URL of the uploaded asset.
 */
export async function uploadAsset(
  fileExtension: string,
  fileType: 'audio' | 'image',
): Promise<string> {
  const s3Key = `${fileType}/${uuid()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: s3Key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
