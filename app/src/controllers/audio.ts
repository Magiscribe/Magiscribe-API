import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config';
import log from '@log';
import { s3Client } from '@utils/clients';
import { VOICES } from '@utils/voices';
import { ElevenLabsClient } from 'elevenlabs';
import { uuid } from 'uuidv4';

/**
 * Generates an audio URL blob from given text and streams it to the client.
 * @param voice {string} The voice ID to use for audio generation.
 * @param text {string} The text to generate audio from.
 * @returns {Promise<string>} The signed URL of the generated audio blob.
 */
export async function generateAudio(
  voice: string,
  text: string,
): Promise<string> {
  log.info({
    msg: 'Starting audio generation',
    voice,
    textLength: text.length,
  });

  if (!VOICES[voice]) {
    log.error({ msg: 'Invalid voice provided', voice });
    throw new Error(`Invalid voice: ${voice}`);
  }

  const client = new ElevenLabsClient({
    apiKey: config.elevenlabs.apiKey,
  });

  try {
    log.debug({
      msg: 'Initiating ElevenLabs API call',
      voice,
      modelId: VOICES[voice].modelId,
    });
    const audioStream = await client.generate({
      stream: true,
      text,
      voice: VOICES[voice].voiceId,
      model_id: VOICES[voice].modelId,
    });
    log.debug({ msg: 'Audio stream received from ElevenLabs' });

    const s3Key = `audio/${uuid()}.mp3`;
    log.trace({ msg: 'Generated S3 key for audio file', s3Key });

    const uploadParams = {
      Bucket: config.mediaAssetsBucketName,
      Key: s3Key,
      Body: audioStream,
    };

    log.debug({
      msg: 'Initiating S3 upload',
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
    });
    const upload = new Upload({
      client: s3Client,
      queueSize: 4,
      leavePartsOnError: false,
      params: uploadParams,
    });

    await upload.done();
    log.info({ msg: 'Audio file uploaded to S3 successfully', s3Key });

    const getObjectCommand = new GetObjectCommand({
      Bucket: config.mediaAssetsBucketName,
      Key: s3Key,
    });

    log.debug({ msg: 'Generating signed URL for audio file' });
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600,
    });
    log.info({ msg: 'Audio generation completed successfully', s3Key });

    return signedUrl;
  } catch (error) {
    log.error({
      msg: 'Failed to generate audio',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to generate audio');
  }
}
