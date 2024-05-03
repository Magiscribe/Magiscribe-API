import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import log from '../../log';

const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

export async function makeRequest({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}) {
  log.debug({
    msg: 'Bedrock request sent',
    system,
    prompt,
  });

  const chat = new BedrockChat({
    region: 'us-east-1',
    model: MODEL_ID,
    maxTokens: 1024,
    temperature: 0.7,
  });

  const result = chat.invoke(`system: ${system}\n${prompt}`);

  const completion = (await result).content;

  log.debug({
    msg: 'Bedrock response recieved',
    content: completion,
  });

  return completion as string;
}
