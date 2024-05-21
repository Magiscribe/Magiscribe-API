import {
  InvocationType,
  InvokeCommand,
  InvokeCommandInput,
} from '@aws-sdk/client-lambda';
import { lambdaClient } from './clients';
import log from '@log';
import config from '@config';

/**
 * Executes Python code on the executor Lambda function.
 * @param code {string} The Python code to execute.
 * @returns {Promise<string>} The result of the Python code execution.
 */
export async function executePythonCode(code: string): Promise<string> {
  // Base case: No Executor Lambda function is defined.
  if (!config.lambda.pythonExecutorName) {
    throw new Error(
      'No executor Lambda function defined.',
    );
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
      log.error({
        msg: 'Python code execution error',
        error: result.FunctionError,
      });
      throw new Error(`Python code execution error: ${result.FunctionError}`);
    }

    // Lambdas return an array of bytes, so we need to convert it to a string.
    const payload = JSON.parse(
      JSON.parse(Buffer.from(result.Payload!).toString()),
    );
    log.debug({
      msg: 'Python code execution response received',
      result: payload,
    });

    return payload;
  } catch (error: any) {
    log.error({
      msg: 'Python code execution error',
      error,
    });
    throw new Error(`Python code execution error: ${error.name}`);
  }

}
