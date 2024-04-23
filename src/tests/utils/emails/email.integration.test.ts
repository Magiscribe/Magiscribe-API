import config from '@/config';
import { UserDataInput } from '@/graphql/codegen';
import { EmailContent, sendEmail } from '@/utils/emails/email';
import { sendInquiryToUsers } from '@/utils/emails/types';
import { randomUUID } from 'crypto';

describe('Email Integration Tests', () => {
  it('should send email with basic template', async () => {
    const emailContent: EmailContent = {
      subject: 'Test Subject',
      templateData: { title: 'Test Title', content: 'Test Content' },
      recipientEmails: [config.email.testEmailTo!],
    };

    await sendEmail(emailContent, 'BASIC');
    await sendEmail(emailContent, 'NOTIFICATION');
  });

  it('should throw error for invalid email', async () => {
    const emailContent: EmailContent = {
      subject: 'Test Subject',
      templateData: { title: 'Test Title', content: 'Test Content' },
      recipientEmails: [config.email.testEmailTo!],
      senderEmail: 'invalid-email',
    };

    await expect(sendEmail(emailContent)).rejects.toThrow();
  });

  it('should send inquiry invite email to user', async () => {
    const userData: UserDataInput = {
      firstName: "Test",
      primaryEmailAddress: config.email.testEmailTo!
    };

    const mockInquiryId = randomUUID();

    await sendInquiryToUsers({userData: [userData], inquiryId: mockInquiryId});
  });

  it('should throw error when sending inquiry invite to an invalid email', async () => {
    const userData: UserDataInput = {
      firstName: "Test",
      primaryEmailAddress: 'invalid-email'
    };

    const mockInquiryId = randomUUID();

    await expect(sendInquiryToUsers({userData: [userData], inquiryId: mockInquiryId})).rejects.toThrow();
  });
});
