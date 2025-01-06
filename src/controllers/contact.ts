import { PublishCommand } from '@aws-sdk/client-sns';
import config from '@/config';
import log from '@/log';
import { snsClient } from '@/utils/clients';

interface ContactInput {
  name: string;
  email: string;
  message: string;
}

/**
 * Sends a contact message to an SNS topic.
 * 
 * @param input - The contact form input containing name, email, and message
 * @returns A promise that resolves to the SNS message ID
 * @throws {Error} If sending the message fails
 */
export async function sendContactMessage(
  input: ContactInput
): Promise<string> {
  log.info({
    msg: 'Sending contact message',
    email: input.email,
  });

  try {
    const command = new PublishCommand({
      TopicArn: config.sns.contactTopicArn,
      Message: JSON.stringify({
        ...input,
        timestamp: new Date().toISOString(),
      }),
      MessageAttributes: {
        'email': {
          DataType: 'String',
          StringValue: input.email,
        },
      },
    });

    const response = await snsClient.send(command);
    
    log.info({
      msg: 'Contact message sent successfully',
      messageId: response.MessageId,
    });

    return response.MessageId || '';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error({
      msg: 'Failed to send contact message',
      error: errorMessage,
    });
    throw new Error('Failed to send contact message: ' + errorMessage);
  }
}
