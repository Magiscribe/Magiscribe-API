import config from '@/config';

import { sendEmail } from './email';
import { UserDataInput } from '@/graphql/codegen';

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
    },
  });
};

export const sendInquiryToUsers = async ({userData, inquiryId}: {
  userData: UserDataInput[], inquiryId: string  
}): Promise<void> => {
  Promise.all(userData.map(async user => {
    await sendEmail({
      recipientEmails: [user.primaryEmailAddress],
      subject: `Inquiry Invitation | Magiscribe`,
      templateData: {
        title: `Congratulations ${user.firstName}, you have been invited to participate in a Magiscribe Inquiry!`,
        content: [
          `Click <a href="${config.email.baseURL}/inquiry/${inquiryId}" target="_blank">here</a> to participate in an exclusive magiscribe inquiry.`,
          `<br />`,
          `<br />`,
        ].join('\n\n'),
      },
    });
  }))

}

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
    },
  });
};

/**
 * Sends welcome email to new user
 * @param emailData - Data needed for email template
 */
export const sendWelcomeEmail = async ({
  recipientEmails,
  firstName,
}: {
  recipientEmails: string[];
  firstName?: string | null;
}): Promise<void> => {
  await sendEmail({
    recipientEmails,
    subject: `Welcome to Magiscribe, ${firstName}!`,
    templateData: {
      title: `Welcome to Magiscribe, ${firstName}!`,
      content: [
        `We're excited to have you here!`,
        `<br />`,
        `<br />`,
        `Magiscribe helps you create dynamic conversations and gather meaningful insights from your audience.`,
        `Get started by exploring our features or creating your first inquiry.`,
        `<br />`,
        `<br />`,
        `If you need help getting started, checkout our <a href="${config.email.baseURL}/dashboard/user-guide" target="_blank">user guide</a>.`,
        `You can also reach out to us at <a href="mailto:management@magiscribe.com" target="_blank">management@magiscribe.com</a>.`,
        `<br />`,
        `<br />`,
        `Thanks for joining us,`,
        `The Magiscribe Team`,
      ].join('\n\n'),
    },
  });
};
