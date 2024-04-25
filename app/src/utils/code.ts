import { InvocationType, InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./clients";

export async function executeCode(code: string): Promise<string> {
    const params: InvokeCommandInput = {
        FunctionName: 'ExecutorFn',
        Payload: JSON.stringify({ code }),
        InvocationType: InvocationType.RequestResponse,
    };

    const result = await lambdaClient.send(new InvokeCommand(params));

    console.log('Result:', result);

    // Convert the result to a string
    let payload = JSON.parse(Buffer.from(result.Payload!).toString());

    return payload;
}