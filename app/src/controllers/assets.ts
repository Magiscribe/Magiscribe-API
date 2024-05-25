import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config';
import { s3Client } from '@utils/clients';
import { uuid } from 'uuidv4';

/**
 * Uploads a media asset to the media assets bucket.
 * @param {string} fileExtension - The extension of the file to upload.
 * @param {string} fileType - The type of the file to upload.
 * @returns {Promise{ message: string, url: string }
 */
export async function uploadMediaAsset(
  fileExtension: string,
  fileType: 'audio' | 'image',
): Promise<{ message: string; url: string }> {
  const s3Key = `${fileType}/${uuid()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: config.mediaAssetsBucketName,
    Key: s3Key,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return {
    message: 'Media asset upload url generated',
    url,
  };
}
