import log from '@log';

/**
 * Executes a function with exponential backoff retry logic
 * @param {function} operation - Async function to execute
 * @param {Object} options - Backoff options
 * @param {number} options.maxAttempts - Maximum number of retry attempts
 * @param {number} options.initialDelay - Initial delay in milliseconds
 * @param {number} options.maxDelay - Maximum delay between retries in milliseconds
 * @returns {Promise<T>} - Result of the operation
 * @throws {Error} - Throws if max attempts reached or unrecoverable error
 */
export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  options = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  },
): Promise<T> {
  let attempt = 0;
  let delay = options.initialDelay;

  while (attempt < options.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt === options.maxAttempts) {
        throw error;
      }

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * 2, options.maxDelay);

      log.debug({
        msg: `Retry attempt ${attempt}/${options.maxAttempts}`,
        delay,
        error,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retry attempts reached');
}
