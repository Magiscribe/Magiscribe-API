import config from '@/config';
import { EmailContent, sendEmail } from '@/utils/emails/email';

describe('Email Integration Tests', () => {
  it('should send email with basic template', async () => {
    const emailContent: EmailContent = {
      subject: 'Test Subject',
      templateData: { title: 'Test Title', content: 'Test Content' },
      recipientEmail: config.email.testEmailTo!,
    };

    await sendEmail(emailContent, 'BASIC');
    await sendEmail(emailContent, 'NOTIFICATION');
  });

  it('should throw error for invalid email', async () => {
    const emailContent: EmailContent = {
      subject: 'Test Subject',
      templateData: { title: 'Test Title', content: 'Test Content' },
      recipientEmail: config.email.testEmailTo!,
      senderEmail: 'invalid-email',
    };

    await expect(sendEmail(emailContent)).rejects.toThrow();
  });
});
