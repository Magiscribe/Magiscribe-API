import { Data } from '@database/models/data';
import {
  DataObject,
  MutationCreateUpdateDataObjectArgs,
} from '@generated/graphql';
import log from '@log';

/**
 * Creates a new data object or updates an existing one based on the presence of an ID.
 * @param data The data object to create or update.
 * @returns The created or updated data object.
 */
export async function createDataObject(
  data: MutationCreateUpdateDataObjectArgs,
): Promise<DataObject> {
  if (!data.id) {
    log.info({
      message: 'Creating new data object',
      data,
    });
    return Data.create(data);
  } else {
    log.info({
      message: 'Updating existing data object',
      data,
    });
    const result = await Data.findOneAndUpdate({ _id: data.id }, data, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      returnDocument: 'after',
    });
    log.info('Data object updated successfully', { result });
    return result;
  }
}

/**
 * Inserts a value into a specified field of a data object.
 * @param id The ID of the data object to update.
 * @param field The field within the data object to update.
 * @param value The value to insert into the field.
 * @returns An object containing the ID and updated data of the data object.
 */
export async function insertIntoDataObject(
  id: string,
  field: string,
  value: unknown,
): Promise<DataObject> {
  log.info('Attempting to update data object', { id, field, value });

  const result = await Data.findOneAndUpdate(
    { _id: id },
    { $push: { [field]: value } },
    { upsert: true, new: true, runValidators: true },
  );

  if (result.errors) {
    log.error('Error updating data object', { id, errors: result.errors });
  } else {
    log.info('Data object updated successfully', { id, result });
  }

  return {
    id: result.id,
    data: result.data,
  };
}

/**
 * Retrieves a data object by its ID.
 * @param id {string} The ID of the data object to retrieve.
 * @returns {Promise<IData | null>} The data object with the specified ID, or null if not found.
 */
export async function getDataObject(id: string): Promise<DataObject> {
  const result = await Data.findOne({ _id: id });
  if (!result) {
    log.warn('Data object not found', { id });
    throw new Error('Data object not found');
  }
  return result;
}
