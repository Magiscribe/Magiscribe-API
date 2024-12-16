import { SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { sesClient } from '@/utils/clients';

import { applyTemplate, EmailTemplate, getTemplate } from './templates';
import config from '@/config';
import log from '@/log';

export interface EmailContent {
  subject: string;
  recipientEmails: string[];
  senderEmail?: string;
  senderName?: string;
  templateData: Record<string, string>;
}

/**
 * Sends an email using AWS SES with template support
 * @param content Email content and recipient information
 * @param templateName Optional template to apply
 */
export const sendEmail = async (
  content: EmailContent,
  templateName: EmailTemplate = 'BASIC',
): Promise<void> => {
  try {
    const template = getTemplate(templateName);
    const htmlContent = applyTemplate(template, {
      ...content.templateData,

      // Base URL for email links will always be provided.
      baseURL: config.email.baseURL,
    });

    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: content.recipientEmails,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlContent,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: content.subject,
        },
      },
      Source: `${content.senderName ?? config.email.fromName} <${content.senderEmail ?? config.email.fromEmail}>`,
    };

    log.info({
      msg: 'Sending email',
      recipientEmails: content.recipientEmails,
      subject: content.subject,
    });
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
  } catch (error) {
    if (error instanceof Error) {
      log.error({
        msg: 'Failed to send email',
        error: error.message,
        recipientEmails: content.recipientEmails,
      });
    }
    throw error;
  }
};

export const emailUtils = {
  sendEmail,
};
