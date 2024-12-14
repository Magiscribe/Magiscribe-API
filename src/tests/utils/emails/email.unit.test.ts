import { sesClient } from '@/utils/clients';
import { sendEmail } from '@/utils/emails/email';
import { applyTemplate, getTemplate } from '@/utils/emails/templates';

jest.mock('@/utils/clients', () => ({
  sesClient: {
    send: jest.fn(),
  },
}));

jest.mock('@/utils/emails/templates', () => ({
  getTemplate: jest.fn(),
  applyTemplate: jest.fn(),
}));

describe('Email Unit Tests', () => {
  const mockSesClient = sesClient as jest.Mocked<typeof sesClient>;
  const mockTemplate = '<html>{{content}}</html>';
  const mockHtmlContent = '<html>Test content</html>';

  beforeEach(() => {
    jest.clearAllMocks();
    (getTemplate as jest.Mock).mockReturnValue(mockTemplate);
    (applyTemplate as jest.Mock).mockReturnValue(mockHtmlContent);
  });

  it('should send email with basic template', async () => {
    const emailContent = {
      subject: 'Test Subject',
      templateData: { content: 'Test Content' },
      recipientEmail: 'test@example.com',
      senderEmail: 'custom@sender.com',
      senderName: 'Custom Sender',
    };

    await sendEmail(emailContent);

    expect(mockSesClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Destination: { ToAddresses: [emailContent.recipientEmail] },
          Message: {
            Body: {
              Html: { Charset: 'UTF-8', Data: mockHtmlContent },
            },
            Subject: { Charset: 'UTF-8', Data: emailContent.subject },
          },
          Source: `${emailContent.senderName} <${emailContent.senderEmail}>`,
        },
      }),
    );
  });

  it('should use custom sender email when provided', async () => {
    const emailContent = {
      subject: 'Test Subject',
      templateData: { content: 'Test Content' },
      recipientEmail: 'test@example.com',
      senderEmail: 'custom@sender.com',
      senderName: 'Custom Sender',
    };

    await sendEmail(emailContent);

    expect(mockSesClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Source: `${emailContent.senderName} <${emailContent.senderEmail}>`,
        }),
      }),
    );
  });

  it('should throw error when SES client fails', async () => {
    const error = new Error('SES error');
    mockSesClient.send.mockImplementationOnce(() => {
      throw error;
    });

    const emailContent = {
      subject: 'Test Subject',
      templateData: { content: 'Test Content' },
      recipientEmail: 'test@example.com',
    };

    await expect(sendEmail(emailContent)).rejects.toThrow('SES error');
  });
});
