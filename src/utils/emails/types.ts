import config from '@/config';
import { sendEmail } from './email';

/**
 * Sends notification email to inquiry owner about new response
 * @param ownerEmail - Email address of inquiry owner
 * @param emailData - Data needed for email template
 */
export const sendOwnerNotification = async ({
  recipientEmails,
  InquiryTitle,
  inquiryId,
  respondenseId,
  respondentName,
}): Promise<void> => {
  await sendEmail({
    recipientEmails,
    subject: `New response recorded | Magiscribe`,
    templateData: {
      title: 'You have received a new response!',
      content: [
        `A new reponse was recieved for ${InquiryTitle} from ${respondentName}.`,
        `<br />`,
        `<br />`,
        `You can view their response <a href="${config.email.baseURL}/dashboard/inquiry-builder/${inquiryId}/analysis?id=${respondenseId}" target="_blank">here</a>.`,
      ].join('\n\n'),
      preview: InquiryTitle,
    },
  });
};

/**
 * Sends confirmation email to respondent
 * @param emailData - Data needed for email template
 */
export const sendRespondentConfirmation = async ({
  recipientEmails,
  respondentName,
  respondenseId,
  inquiryTitle,
  inquiryId,
}): Promise<void> => {
  if (!recipientEmails) return;

  const firstName = respondentName?.split(' ')[0];

  await sendEmail({
    recipientEmails,
    subject: `${firstName ? `${firstName}, y` : 'Y'}our response has been received | Magiscribe`,
    templateData: {
      title: 'We received your response!',
      content: [
        `${firstName ? `${firstName}, t` : 'T'}hank you for submitting your response for ${inquiryTitle}.`,
        `<br />`,
        `<br />`,
        `If you would like to review your responses, you can view them <a href="${config.email.baseURL}/inquiry/response/${inquiryId}?id=${respondenseId}" target="_blank">here</a>.`,
      ].join('\n\n'),
      preview: inquiryTitle,
    },
  });
};
