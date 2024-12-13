import { SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { sesClient } from '@utils/clients';

import { applyTemplate, EmailTemplate, getTemplate } from './templates';

interface EmailContent {
  subject: string;
  body: string;
  recipientEmail: string;
  senderEmail?: string;
  templateData?: Record<string, any>;
}

/**
 * Sends an email using AWS SES with template support
 * @param content Email content and recipient information
 * @param templateName Optional template to apply
 */
export const sendEmail = async (
  content: EmailContent,
  templateName: EmailTemplate = 'BASIC'
): Promise<void> => {
  try {
    const template = getTemplate(templateName);
    const htmlContent = applyTemplate(template, content.templateData || {});
    
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [content.recipientEmail],
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
      Source: content.senderEmail || process.env.DEFAULT_SENDER_EMAIL,
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const emailUtils = {
  sendEmail
};