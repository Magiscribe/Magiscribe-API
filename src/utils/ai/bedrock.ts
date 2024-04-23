import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient } from '../clients';

const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
const ANTHROPIC_VERSION = 'bedrock-2023-05-31';

export async function makeBedrockRequest({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}) {
  // Here, we are using the Bedrock SDK to send a request to the model.
  // Why not LangChain you might ask, because as of now (4/11/2024), LangChain
  // can't update their goddamn class objects for Claude Haiku or Sonnect.
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: ANTHROPIC_VERSION,
      max_tokens: 500,
      system,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const data = await bedrockClient.send(command);
  const completion = JSON.parse(Buffer.from(data.body).toString('utf-8'));

  return completion.content[0].text;
}
