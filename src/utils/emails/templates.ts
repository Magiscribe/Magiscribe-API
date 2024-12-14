import basicTemplate from './templates/basic';
import notificationTemplate from './templates/notification';

/** Available email template types */
export type EmailTemplate = 'BASIC' | 'NOTIFICATION';

/** Template data structure for variable interpolation */
export type TemplateData = Record<string, string>;

const templates: Record<EmailTemplate, string> = {
  BASIC: basicTemplate,
  NOTIFICATION: notificationTemplate,
};

/**
 * Gets an email template
 * @param templateName - Name of the template to load
 * @returns Template string
 * @throws Error if template doesn't exist
 */
export const getTemplate = (templateName: EmailTemplate): string => {
  return templates[templateName];
};

/**
 * Applies data to a template string
 * @param template - Template string containing variables
 * @param data - Data object with values to inject into template
 * @returns Processed template with all variables replaced
 * @example
 * const result = applyTemplate("<h1>{{title}}</h1>", { title: "Hello World" });
 */
export const applyTemplate = (template: string, data: TemplateData): string => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }, template);
};
