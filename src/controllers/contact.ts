import config from '@/config';
import log from '@/log';
import { sqsClient } from '@/utils/clients';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { v4 as uuid } from 'uuid';

interface ContactInput {
  name: string;
  email: string;
  message: string;
}

/**
 * Sends a contact message to an SQS queue.
 *
 * @param input - The contact form input containing name, email, and message
 * @returns A promise that resolves to the SQS message ID
 * @throws {Error} If sending the message fails
 */
export async function sendContactMessage(input: ContactInput): Promise<string> {
  log.info({
    msg: 'Sending contact message',
    email: input.email,
  });

  try {
    const command = new SendMessageCommand({
      QueueUrl: config.sqs.contactQueueUrl,
      MessageGroupId: uuid(),
      MessageBody: JSON.stringify({
        ...input,
        timestamp: new Date().toISOString(),
      }),
      MessageAttributes: {
        email: {
          DataType: 'String',
          StringValue: input.email,
        },
      },
    });

    const response = await sqsClient.send(command);

    log.info({
      msg: 'Contact message sent successfully',
      messageId: response.MessageId,
    });

    return response.MessageId || '';
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log.error({
      msg: 'Failed to send contact message',
      error: errorMessage,
    });
    throw new Error('Failed to send contact message: ' + errorMessage);
  }
}
