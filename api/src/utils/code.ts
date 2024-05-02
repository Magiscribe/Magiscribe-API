import { InvocationType, InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./clients";

export async function executeCode(code: string): Promise<string> {
    const params: InvokeCommandInput = {
        FunctionName: process.env.EXECUTOR_LAMBDA_NAME!,
        Payload: JSON.stringify({ code }),
        InvocationType: InvocationType.RequestResponse,
    };

    const result = await lambdaClient.send(new InvokeCommand(params));

    // Convert the result to a string
    let payload = JSON.parse(Buffer.from(result.Payload!).toString());

    return payload;
}