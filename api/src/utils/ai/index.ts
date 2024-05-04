import log from '@log';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';

const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

export async function makeSyncRequest({
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

  const result = chat.invoke(`${system}\n${prompt}`);

  const completion = (await result).content;

  log.debug({
    msg: 'Bedrock response recieved',
    content: completion,
  });

  return completion as string;
}

export async function makeStreamingRequest(
  {
    prompt,
  }: {
    prompt: string;
  },
  callback: (content: string) => Promise<void>,
) {
  log.debug({
    msg: 'Bedrock request sent',
    prompt,
  });

  const chat = new BedrockChat({
    region: 'us-east-1',
    model: MODEL_ID,
    maxTokens: 1024,
    temperature: 0.7,
  });

  const stream = await chat.stream(prompt);
  const chunks: string[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk.content as string);
    await callback(chunks.join(''));
    log.debug({
      msg: 'Bedrock response recieved',
      content: chunks.join(''),
    });
  }

  return chunks.join('') as string;
}
