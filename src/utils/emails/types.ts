import config from "@/config";
import { sendEmail } from "./email";

/**
 * Sends notification email to inquiry owner about new response
 * @param ownerEmail - Email address of inquiry owner
 * @param emailData - Data needed for email template
 */
export const sendOwnerNotification = async ({ recipientEmails, InquiryTitle, inquiryId, respondentName }): Promise<void> => {
    await sendEmail({
      recipientEmails,
      subject: `New response recorded | ${InquiryTitle}`,
      templateData: {
        title: 'You have received a new response!',
        content: [
          `${respondentName} has submitted a response for ${InquiryTitle}.`,
          `You can view the response at <a href="${config.email.baseURL}/dashboard/inquiry-builder/${inquiryId}" target="_blank">here</a>.`
        ].join('\n\n')
      }
    });
  };
  
  /**
   * Sends confirmation email to respondent
   * @param emailData - Data needed for email template
   */
  export const sendRespondentConfirmation = async ({ recipientEmails, respondentName, inquiryTitle, inquiryId }): Promise<void> => {
    if (!recipientEmails) return;
  
    const firstName = respondentName?.split(' ')[0];
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
  
    await sendEmail({
      recipientEmails,
      subject: `${firstName ? `${firstName}, y` : 'Y'}our response has been received | ${inquiryTitle}`,
      templateData: {
        title: 'We received your response!',
        content: [
          `${firstName ? `${firstName}, t` : 'T'}hank you for submitting your response for ${inquiryTitle}.`,
          `We received it at ${timestamp}.`,
          ``,
          `You can view the response at <a href="${config.email.baseURL}/dashboard/inquiry-builder/${inquiryId}" target="_blank">here</a>.`
        ].join('\n\n')
      }
    });
  };