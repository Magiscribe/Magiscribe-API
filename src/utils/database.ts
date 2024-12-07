import type { FloatFilter, StringFilter } from '@graphql/codegen';

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

type FilterField<T> = T extends FloatFilter
  ? { [K in keyof FloatFilter]?: number }
  : T extends StringFilter
    ? { [K in keyof StringFilter]?: string }
    : never;

type MongoDBValue = {
  $eq?: number | string;
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $regex?: string;
  $options?: string;
};

/**
 * Creates a MongoDB filter condition for a specific field based on provided filter
 * @param fieldPath The path to the field in MongoDB (supports dot notation for nested fields)
 * @param filter The filter object (FloatFilter or StringFilter)
 * @returns MongoDB filter condition object or empty object if no filter provided
 */
export function createFilterCondition(
  fieldPath: string,
  filter?: FilterField<FloatFilter> | FilterField<StringFilter>,
) {
  // Return early if filter is undefined or empty object
  if (!filter || Object.keys(filter).length === 0) return {};

  const conditions: Record<string, MongoDBValue> = {};

  // Handle numeric comparisons
  if ('eq' in filter && filter.eq != null) {
    conditions[fieldPath] = { ...conditions[fieldPath], $eq: filter.eq };
  }
  if ('gt' in filter && filter.gt != null) {
    conditions[fieldPath] = { ...conditions[fieldPath], $gt: filter.gt };
  }
  if ('gte' in filter && filter.gte != null) {
    conditions[fieldPath] = { ...conditions[fieldPath], $gte: filter.gte };
  }
  if ('lt' in filter && filter.lt != null) {
    conditions[fieldPath] = { ...conditions[fieldPath], $lt: filter.lt };
  }
  if ('lte' in filter && filter.lte != null) {
    conditions[fieldPath] = { ...conditions[fieldPath], $lte: filter.lte };
  }

  // Handle string comparisons - only create regex if we have actual string values
  if (
    'contains' in filter &&
    typeof filter.contains === 'string' &&
    filter.contains.length > 0
  ) {
    conditions[fieldPath] = { $regex: filter.contains, $options: 'i' };
  }
  if (
    'startsWith' in filter &&
    typeof filter.startsWith === 'string' &&
    filter.startsWith.length > 0
  ) {
    conditions[fieldPath] = { $regex: `^${filter.startsWith}`, $options: 'i' };
  }
  if (
    'endsWith' in filter &&
    typeof filter.endsWith === 'string' &&
    filter.endsWith.length > 0
  ) {
    conditions[fieldPath] = { $regex: `${filter.endsWith}$`, $options: 'i' };
  }

  return conditions;
}

/**
 * Creates a MongoDB filter object from multiple field filters
 * @param filters Object containing field paths and their corresponding filters
 * @returns MongoDB filter object combining all conditions
 */
export function createFilterQuery(
  filters: Record<string, FilterField<FloatFilter> | FilterField<StringFilter>>,
) {
  if (!filters || Object.keys(filters).length === 0) return {};

  const conditions = Object.entries(filters)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, filter]) => filter && Object.keys(filter).length > 0)
    .map(([fieldPath, filter]) => createFilterCondition(fieldPath, filter))
    .filter((condition) => Object.keys(condition).length > 0);

  return conditions.length ? { $and: conditions } : {};
}
