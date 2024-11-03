import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@config';
import { Audio } from '@database/models/audio';
import log from '@log';
import { s3Client } from '@utils/clients';
import { VOICES } from '@utils/voices';
import { ElevenLabsClient } from 'elevenlabs';
import { uuid } from 'uuidv4';

/**
 * Generates an audio URL blob from given text and streams it to the client.
 *
 * @description
 * This function handles the following operations:
 * 1. Validates the voice ID against available voices
 * 2. Checks for existing audio in the database
 * 3. Generates new audio using ElevenLabs API if needed
 * 4. Uploads the audio to S3
 * 5. Returns a signed URL for the audio file
 *
 * @param voice - The voice ID to use for audio generation
 * @param text - The text to generate audio from
 * @returns A promise that resolves to a signed URL for the generated audio
 * @throws {Error} If the voice is invalid or audio generation fails
 */
export async function generateAudio(
  voice: string,
  text: string,
): Promise<string> {
  const SIGNED_URL_EXPIRATION = 3600; // 1 hour
  const S3_PREFIX = 'audio';

  // Start with input validation
  log.info({
    msg: 'Starting audio generation',
    voice,
    textLength: text.length,
  });

  if (!VOICES[voice]) {
    const error = new Error(`Invalid voice: ${voice}`);
    log.error({ msg: 'Invalid voice provided', voice, error: error.message });
    throw error;
  }

  try {
    // Check cache first
    const existingAudio = await Audio.findOne({ text, voiceId: voice });

    if (existingAudio) {
      log.info({ msg: 'Audio cache hit', s3Key: existingAudio.s3Key });
      return await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: config.mediaAssetsBucketName,
          Key: existingAudio.s3Key,
        }),
        { expiresIn: SIGNED_URL_EXPIRATION },
      );
    }

    // Generate new audio
    const client = new ElevenLabsClient({ apiKey: config.elevenlabs.apiKey });
    const s3Key = `${S3_PREFIX}/${uuid()}.mp3`;

    log.debug({
      msg: 'Generating audio',
      voice,
      modelId: VOICES[voice].modelId,
      s3Key,
    });

    const audioStream = await client.generate({
      stream: true,
      text,
      voice: VOICES[voice].voiceId,
      model_id: VOICES[voice].modelId,
    });

    // Upload to S3 with optimized settings
    const upload = new Upload({
      client: s3Client,
      queueSize: 4, // Optimal for most use cases
      leavePartsOnError: false,
      params: {
        Bucket: config.mediaAssetsBucketName,
        Key: s3Key,
        Body: audioStream,
      },
    });

    // Save metadata and complete upload in parallel
    await Promise.all([
      Audio.create({ text, voiceId: voice, s3Key }),
      upload.done(),
    ]);

    log.info({ msg: 'Audio generation and upload completed', s3Key });

    // Generate signed URL for the new audio
    return await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: config.mediaAssetsBucketName,
        Key: s3Key,
      }),
      { expiresIn: SIGNED_URL_EXPIRATION },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log.error({
      msg: 'Audio generation failed',
      voice,
      textLength: text.length,
      error: errorMessage,
    });
    throw new Error('Failed to generate audio: ' + errorMessage);
  }
}
