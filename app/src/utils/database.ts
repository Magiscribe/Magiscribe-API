/**
 * Creates a nested update object for partial updates in databases or APIs.
 *
 * @param {Object} options - The options for creating the update object.
 * @param {Record<string, string>} options.data - The source data object.
 * @param {string} [options.prefix='data'] - The prefix for nested keys.
 * @param {string[]} [options.fields] - Specific fields to include in the update.
 * @returns {Record<string, string>} A new object with nested keys for updates.
 *
 * @example
 * const sourceData = { name: 'John', age: 30, email: 'john@example.com' };
 * const updateObject = createNestedUpdateObject({
 *   data: sourceData,
 *   prefix: 'user',
 *   fields: ['name', 'age']
 * });
 * Result: { 'user.name': 'John', 'user.age': 30 }
 */
export function createNestedUpdateObject({
  data,
  prefix = 'data',
  fields,
}: {
  data: Record<string, string>;
  prefix?: string;
  fields?: string[];
}): Record<string, string> {
  return fields && fields.length > 0
    ? fields.reduce((acc, field) => {
        acc[`${prefix}.${field}`] =
          data[field] !== undefined ? data[field] : null;
        return acc;
      }, {})
    : Object.keys(data).reduce((acc, key) => {
        acc[`${prefix}.${key}`] = data[key];
        return acc;
      }, {});
}
