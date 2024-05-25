import { GetObjectCommand } from '@aws-sdk/client-s3';
import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import config from '@config';
import { s3Client, transcribeClient } from '@utils/clients';

/**
 * Generates a transcription for the given audio file asset.
 * @param {string} s3Key - The key of the audio file to transcribe.
 * @returns {Promise<void>}
 */
export async function generateTranscription(s3Key: string): Promise<string> {
  const job = `${new Date().getTime()}-${s3Key}`;
  const response = await transcribeClient.send(
    new StartTranscriptionJobCommand({
      TranscriptionJobName: job,
      LanguageCode: 'en-US',
      Media: {
        MediaFileUri: `s3://${config.mediaAssetsBucketName}/audio/${s3Key}`,
      },
      OutputBucketName: config.mediaAssetsBucketName,
      OutputKey: `transcriptions/${job}.json`,
    }),
  );

  // iF successful, wait for the transcription job to complete
  if (response.TranscriptionJob?.TranscriptionJobStatus === 'IN_PROGRESS') {
    await new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const { TranscriptionJob } = await transcribeClient.send(
          new GetTranscriptionJobCommand({
            TranscriptionJobName: job,
          }),
        );

        if (TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
          clearInterval(interval);
          resolve(TranscriptionJob);
        }

        if (TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
          clearInterval(interval);
          reject('Transcription job failed');
        }
      }, 250);
    });

    // Gets the transcription job
    const transcript = await s3Client.send(
      new GetObjectCommand({
        Bucket: config.mediaAssetsBucketName,
        Key: `transcriptions/${job}.json`,
      }),
    );

    if (!transcript.Body) {
      return 'Transcription job failed';
    }

    // Converts the transcript to a string
    const transcriptBody = await new Response(transcript.Body).text();
    const result = JSON.parse(transcriptBody)
      .results.transcripts.map((transcript) => transcript.transcript)
      .join(' ');

    return result;
  } else {
    return 'Transcription job failed';
  }
}
