import { Inquiry, InquiryResponse } from '@database/models/inquiry';
import {
  Inquiry as TInquiry,
  InquiryResponse as TInquiryResponse,
} from '@generated/graphql';
import log from '@log';

/**
 * Creates a new data object or updates an existing one based on the presence of an ID.
 * @param data The data object to create or update.
 * @returns The created or updated data object.
 */
export async function createInquiry({ id, userId, data }): Promise<TInquiry> {
  if (!id) {
    log.info({
      message: 'Creating new data object',
      data,
    });
    return Inquiry.create({
      data,
      userId,
    });
  } else {
    log.info({
      message: 'Updating existing data object',
      data,
    });
    const result = await Inquiry.findOneAndUpdate(
      { _id: id, userId },
      {
        data,
        userId,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    log.info('Inquiry updated successfully', { result });
    return result;
  }
}

/**
 * Deletes a data object by its ID.
 * @param id The ID of the data object to delete.
 * @param userId The ID of the user who owns the data object.
 * @returns {Promise<void>} A promise that resolves when the data object is deleted.
 */
export async function deleteInquiry({ id, userId }): Promise<void> {
  log.info({
    message: 'Deleting data object',
    id,
  });

  const result = await Inquiry.deleteOne({ _id: id, userId });

  if (result.deletedCount === 0) {
    log.warn({
      message: 'Data object not found',
      id,
    });
    throw new Error('Data object not found');
  }

  log.info({
    message: 'Data object deleted successfully',
    id,
  });
}

/**
 * Retrieves a data object by its ID.
 * @param id {string} The ID of the data object to retrieve.
 * @returns {Promise<IData | null>} The data object with the specified ID, or null if not found.
 */
export async function getInquiry(id: string): Promise<TInquiry> {
  const result = await Inquiry.findOne({ _id: id });
  if (!result) {
    log.warn({
      message: 'Data object not found',
      id,
    });
    throw new Error('Data object not found');
  }
  return result;
}

/**
 * Retrieves all data objects associated with a specific user ID.
 * @param userId {string} The ID of the user whose forms we want to retrieve.
 * @returns {Promise<DataObject[]>} An array of data objects associated with the user.
 */
export async function getInquiries(userId: string): Promise<TInquiry[]> {
  log.info({
    message: 'Fetching user data',
    userId,
  });

  try {
    const result = await Inquiry.find({ userId });

    log.info({
      message: 'User data fetched successfully',
      userId,
      count: result.length,
    });

    return result;
  } catch {
    log.error({
      message: 'Failed to fetch user data',
      userId,
    });
    throw new Error('Failed to fetch user forms');
  }
}

/**
 * Creates a new data object or updates an existing one based on the presence of an ID.
 * @param data The data object to create or update.
 * @returns {Promise<TInquiry>} The created or updated data object.
 */
export async function createInquiryResponse({
  id,
  inquiryId,
  userId,
  data,
}): Promise<TInquiry> {
  if (!id) {
    log.info({
      message: 'Creating new inquiry response',
      data,
    });
    const result = await InquiryResponse.create({
      data,
      userId,
    });

    // Find the inquiry by ID and add the new response to its responses array if not already present
    await Inquiry.findByIdAndUpdate(
      inquiryId,
      { $addToSet: { responses: result._id } },
      { new: true },
    );

    return result;
  } else {
    log.info({
      message: 'Updating existing inquiry response',
      data,
    });
    return InquiryResponse.findOneAndUpdate(
      { _id: id, userId },
      {
        data,
        userId,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  }
}

/**
 * Retrieves all responses associated with a specific inquiry ID.
 * @param data The data object to create or update.
 * @returns {Promise<InquiryResponse[]>} An array of responses associated with the inquiry.
 */
export async function getInquiryResponses({ id }): Promise<TInquiryResponse[]> {
  const inquiry = await Inquiry.findById({
    _id: id,
  }).populate('responses');

  if (!inquiry) {
    throw new Error('Inquiry not found');
  }

  if (!inquiry.responses) {
    throw new Error('Inquiry responses not found');
  }

  return inquiry.responses;
}
