import {
  InvocationType,
  InvokeCommand,
  InvokeCommandInput,
} from '@aws-sdk/client-lambda';
import { lambdaClient } from './clients';
import log from '@log';
import config from '@config';

/**
 * Cleans a code block by removing the ```language and ``` tags
 * @param code {string} The code block to clean
 * @returns {string} The cleaned code block
 */
export function cleanCodeBlock(code: string): string {
  // Regular expression to match ```language at the beginning and ``` at the end of the string
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/;

  // Extract the code block between ```language and ```
  const match = code.match(codeBlockRegex);
  if (match && match[1]) {
    code = match[1];
  }

  return code;
}

/**
 * Extracts the first matching output from a string based on a given filter.
 *
 * @param {string} result - The string to search within.
 * @param {string|RegExp} outputFilter - The regular expression pattern to match against.
 * @returns {string} The first matched substring, or an empty string if no match is found.
 */
export function applyFilter(
  result: string,
  outputFilter: RegExp | string | null | undefined,
): string {
  // If no pattern is provided, return the original text
  if (!outputFilter) {
    return result;
  }

  // If pattern is a string, convert it to a RegExp object
  const regex =
    typeof outputFilter === 'string'
      ? new RegExp(outputFilter, 'g')
      : new RegExp(
          outputFilter.source,
          outputFilter.flags + (outputFilter.flags.includes('g') ? '' : 'g'),
        );

  // Find all matches
  const matches = Array.from(result.matchAll(regex));

  // If no matches found, return the original text
  if (matches.length === 0) {
    return result;
  }

  // Process matches and their groups
  const processedMatches = matches.map((match) => {
    return match[match.length > 1 ? 1 : 0];
  });

  // Join all processed matches
  return processedMatches.join(', ');
}

/**
 * Executes Python code on the executor Lambda function.
 * @param code {string} The Python code to execute.
 * @returns {Promise<string> | Error} The result of the Python code execution.
 */
export async function executePythonCode(code: string): Promise<string> {
  log.trace('Executing Python code', { msg: code });
  if (!config.lambda.pythonExecutorName) {
    throw new Error('No executor Lambda function defined.');
  }

  try {
    const params: InvokeCommandInput = {
      FunctionName: config.lambda.pythonExecutorName,
      Payload: JSON.stringify({ code }),
      InvocationType: InvocationType.RequestResponse,
    };

    log.debug({ msg: 'Python code execution request sent', params });

    const result = await lambdaClient.send(new InvokeCommand(params));

    if (result.FunctionError) {
      log.warn({
        msg: 'Ouch, bitten by a python before you went out in nature! (Python code execution error)',
        error: result.FunctionError,
      });
      const error = new Error(result.FunctionError);
      error['isPythonExecutionError'] = true;
      throw error;
    }

    const payload = JSON.parse(
      JSON.parse(Buffer.from(result.Payload!).toString()),
    );
    log.debug({
      msg: 'Python code execution response received',
      result: payload,
    });

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      log.error({
        msg: 'You are dying of a Python bite, please seek professional help immediately! (Python code execution error)',
        error: error.message,
      });
    }
    return JSON.stringify(error);
  }
}
