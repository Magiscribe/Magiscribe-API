import { readFileSync } from 'fs';
import { join } from 'path';

/** Available email template types */
export type EmailTemplate = 'BASIC' | 'MARKETING' | 'NOTIFICATION';

/** Template data structure for variable interpolation */
export type TemplateData = Record<string, string>;

/** Cache to store loaded templates and avoid repeated disk reads */
const templateCache = new Map<EmailTemplate, string>();

/**
 * Replaces template variables with provided data
 * @param template - HTML template string with ${variable} syntax
 * @param data - Object containing variable values to interpolate
 * @returns Interpolated template string with replaced variables
 * @example
 * interpolate("Hello ${name}!", { name: "John" }) // Returns "Hello John!"
 */
const interpolate = (template: string, data: TemplateData): string => {
  return template.replace(/\${(\w+)}/g, (_, key) => data[key] || '');
};

/**
 * Loads and caches an email template from the filesystem
 * @param templateName - Name of the template to load
 * @returns Raw template string from file
 * @throws Error if template file cannot be read
 * @example
 * const template = getTemplate('BASIC');
 */
export const getTemplate = (templateName: EmailTemplate): string => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = join(__dirname, `${templateName.toLowerCase()}.html`);
  const templateContent = readFileSync(templatePath, 'utf-8');
  
  templateCache.set(templateName, templateContent);
  return templateContent;
};

/**
 * Applies data to a template string
 * @param template - Template string containing variables
 * @param data - Data object with values to inject into template
 * @returns Processed template with all variables replaced
 * @example
 * const result = applyTemplate("<h1>${title}</h1>", { title: "Welcome" });
 */
export const applyTemplate = (template: string, data: TemplateData): string => {
  return interpolate(template, data);
};