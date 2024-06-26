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
 * Executes Python code on the executor Lambda function.
 * @param code {string} The Python code to execute.
 * @returns {Promise<string>} The result of the Python code execution.
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
        msg: 'Python code execution error',
        error: result.FunctionError,
      });
      const error = new Error(result.FunctionError);
      error['isPythonExecutionError'] = true;
      throw error;
    }

    log.debug({
      msg: 'Python code execution response received',
      result: Buffer.from(result.Payload!).toString(),
    });
    const payload = JSON.parse(
      JSON.parse(Buffer.from(result.Payload!).toString()),
    );
    log.debug({
      msg: 'Python code execution response received',
      result: payload,
    });

    return payload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof Error && !('isPythonExecutionError' in error)) {
      log.error({
        msg: 'Python code execution error, trying to autofix for daddy',
        error: error.message,
      });
      (error as Error)['isPythonExecutionError'] = true;
    }
    throw error;
  }
}
