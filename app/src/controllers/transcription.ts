import { GetObjectCommand } from '@aws-sdk/client-s3';
import { AssumeRoleCommand } from '@aws-sdk/client-sts';
import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import config from '@config';
import log from '@log';
import { s3Client, stsClient, transcribeClient } from '@utils/clients';
import { uuid } from 'uuidv4';

/**
 * Generates a transcription for the given audio file asset.
 * @param {string} fileName - The key of the audio file to transcribe.
 * @returns {Promise<void>}
 */
export async function transcribeAudio(fileName: string): Promise<string> {
  const jobName = uuid();

  log.debug({ msg: 'Transcription job started', jobName });
  await transcribeClient.send(
    new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri: `s3://${config.mediaAssetsBucketName}/audio/${fileName}`,
      },
      OutputBucketName: config.mediaAssetsBucketName,
      OutputKey: `transcriptions/${jobName}.json`,
    }),
  );

  // If successful, wait for the transcription job to complete
  log.debug({ msg: 'Waiting for transcription job to complete', jobName });
  await new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const { TranscriptionJob } = await transcribeClient.send(
        new GetTranscriptionJobCommand({
          TranscriptionJobName: jobName,
        }),
      );

      if (TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
        log.debug({ msg: 'Transcription job completed', jobName });
        clearInterval(interval);
        resolve(TranscriptionJob);
      }

      if (TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
        log.error({ msg: 'Transcription job failed', jobName });
        clearInterval(interval);
        reject('Transcription job failed');
      }
    }, 250);
  });

  // Gets the transcription job
  log.debug({ msg: 'Retrieving transcription job', jobName });
  const transcript = await s3Client.send(
    new GetObjectCommand({
      Bucket: config.mediaAssetsBucketName,
      Key: `transcriptions/${jobName}.json`,
    }),
  );

  // Converts the transcript to a string
  log.debug({ msg: 'Parsing transcription job', jobName });
  const transcriptBody = await new Response(transcript.Body).text();
  const result = JSON.parse(transcriptBody)
    .results.transcripts.map((transcript) => transcript.transcript)
    .join(' ');

  return result;
}

/**
 * This returns a set of temporary credentials that can be used to transcribe an audio file.
 * @returns {Promise<{ accessKeyId: string, secretAccessKey: string, sessionToken: string }>} The temporary credentials.
 */
export async function generateTranscriptionStreamingCredentials(): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}> {
  // Uses STS to generate temporary credentials for the transcription job.
  // This is to ensure that the transcription job has access to the audio file.
  log.debug({ msg: 'Generating transcription streaming credentials' });
  const result = await stsClient.send(
    new AssumeRoleCommand({
      RoleArn: config.transcribeStreamingRole,
      RoleSessionName: 'transcribe-session',
      DurationSeconds: 900, // 15 minutes
    }),
  );

  log.debug({ msg: 'Transcription streaming credentials generated' });

  if (!result.Credentials) {
    throw new Error('Failed to generate transcription streaming credentials');
  }

  if (
    !result.Credentials.AccessKeyId ||
    !result.Credentials.SecretAccessKey ||
    !result.Credentials.SessionToken
  ) {
    throw new Error(
      'Missing required fields in transcription streaming credentials',
    );
  }

  return {
    accessKeyId: result.Credentials.AccessKeyId,
    secretAccessKey: result.Credentials.SecretAccessKey,
    sessionToken: result.Credentials.SessionToken,
  };
}
