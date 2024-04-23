import config from '@/config';
import * as emailModule from '@/utils/emails/email';
import {
  sendOwnerNotification,
  sendRespondentConfirmation,
  sendWelcomeEmail,
} from '@/utils/emails/types';

describe('Email Types Integration Tests', () => {
  let sendEmailSpy: jest.SpyInstance;

  beforeEach(() => {
    sendEmailSpy = jest.spyOn(emailModule, 'sendEmail');
  });

  afterEach(() => {
    sendEmailSpy.mockRestore();
  });

  describe('sendOwnerNotification', () => {
    it('should send owner notification email', async () => {
      await sendOwnerNotification({
        recipientEmails: [config.email.testEmailTo!],
        InquiryTitle: 'Test Inquiry',
        inquiryId: 'inq123',
        respondenseId: 'resp123',
        respondentName: 'John Doe',
      });

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmails: [config.email.testEmailTo!],
          subject: expect.stringContaining('New response recorded'),
        }),
      );
    });
  });

  describe('sendRespondentConfirmation', () => {
    it('should send confirmation with first name', async () => {
      await sendRespondentConfirmation({
        recipientEmails: [config.email.testEmailTo!],
        respondentName: 'John Doe',
        respondenseId: 'resp123',
        inquiryTitle: 'Test Inquiry',
        inquiryId: 'inq123',
      });

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmails: [config.email.testEmailTo!],
          subject: expect.stringContaining('John, your response'),
        }),
      );
    });

    it('should handle missing respondent name', async () => {
      await sendRespondentConfirmation({
        inquiryId: 'inq123',
        inquiryTitle: 'Test Inquiry',
        recipientEmails: [config.email.testEmailTo!],
        respondenseId: 'resp123',
        respondentName: undefined,
      });

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Your response'),
        }),
      );
    });

    it('should skip sending if no recipient emails', async () => {
      await sendRespondentConfirmation({
        recipientEmails: undefined,
        respondentName: 'John Doe',
        respondenseId: 'resp123',
        inquiryTitle: 'Test Inquiry',
        inquiryId: 'inq123',
      });

      expect(sendEmailSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      await sendWelcomeEmail({
        recipientEmails: [config.email.testEmailTo!],
        firstName: 'John',
      });

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmails: [config.email.testEmailTo!],
          subject: expect.stringContaining('Welcome to Magiscribe, John'),
        }),
      );
    });
  });
});
