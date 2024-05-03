import {
  InvocationType,
  InvokeCommand,
  InvokeCommandInput,
} from '@aws-sdk/client-lambda';
import { lambdaClient } from './clients';
import log from '../log';

/**
 * Executes Python code on the executor Lambda function.
 * @param code {string} The Python code to execute.
 * @returns {Promise<string>} The result of the Python code execution.
 */
export async function executePythonCode(code: string): Promise<string> {
  // Base case: No Executor Lambda function is defined.
  const executorLambdaName = process.env.EXECUTOR_LAMBDA_NAME;
  if (!executorLambdaName) {
    throw new Error(
      'No executor Lambda function defined. Use EXECUTOR_LAMBDA_NAME environment variable.',
    );
  }

  const params: InvokeCommandInput = {
    FunctionName: executorLambdaName,
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

  const payload = Buffer.from(result.Payload!).toString();
  log.debug({
    msg: 'Python code execution response received',
    result: payload,
  });

  // Lambdas return an array of bytes, so we need to convert it to a string.
  return payload;
}
