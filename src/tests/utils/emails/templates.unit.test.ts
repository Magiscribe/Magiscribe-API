import { applyTemplate, getTemplate } from '@/utils/emails/templates';

describe('Email Templates', () => {
  describe('getTemplate', () => {
    it('should return basic template', () => {
      const template = getTemplate('BASIC');
      expect(template).toBeDefined();
      expect(template).toContain('{{title}}');
      expect(template).toContain('{{content}}');
    });

    it('should return notification template', () => {
      const template = getTemplate('NOTIFICATION');
      expect(template).toBeDefined();
      expect(template).toContain('{{title}}');
      expect(template).toContain('{{content}}');
    });
  });

  describe('applyTemplate', () => {
    it('should interpolate variables in template', () => {
      const template = getTemplate('BASIC');
      const result = applyTemplate(template, {
        title: 'Welcome',
        content: 'Hello World',
      });

      expect(result).toContain('Welcome');
      expect(result).toContain('Hello World');
      expect(template).toContain('{{title}}');
      expect(template).toContain('{{content}}');
    });

    it('should handle missing variables', () => {
      const template = getTemplate('BASIC');
      const result = applyTemplate(template, {
        title: 'Welcome',
        // content is missing
      });

      expect(result).toContain('Welcome');
      expect(template).toContain('{{title}}');
      expect(template).toContain('{{content}}');
    });
  });
});
