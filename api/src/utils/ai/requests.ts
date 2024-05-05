import log from '@log';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';

const modelProps = {
  region: 'us-east-1',
  model: 'anthropic.claude-3-haiku-20240307-v1:0',
  maxTokens: 1024,
  temperature: 0.7,
};

const model = new BedrockChat(modelProps);

/**
 * Sends a synchronous request to the Bedrock model and returns the response.
 *
 * @param {object} params - An object containing the system and prompt strings.
 * @param {string} params.system - The system string to provide context to the model.
 * @param {string} params.prompt - The prompt string to send to the model.
 * @returns {Promise<string>} The response from the model.
 */
export async function makeSyncRequest({
  system,
  prompt,
}: {
  system: string;
  prompt: string;
}): Promise<string> {
  log.debug({ msg: 'Bedrock request sent', system, prompt });
  const completion = await model.invoke(`${system}\n${prompt}`);
  log.debug({ msg: 'Bedrock response received', content: completion.content });
  return completion.content as string;
}

/**
 * Sends a streaming request to the Bedrock model and calls a callback function with the response chunks.
 *
 * @param {object} params - An object containing the prompt string.
 * @param {string} params.prompt - The prompt string to send to the model.
 * @param {Function} callback - A callback function to handle the response chunks.
 * @returns {Promise<string>} The full response from the model.
 */
export async function makeStreamingRequest(
  { prompt }: { prompt: string },
  callback: (content: string) => Promise<void>,
): Promise<string> {
  log.debug({ msg: 'Bedrock request sent', prompt });
  const stream = await model.stream(prompt);
  let buffer = '';
  for await (const chunk of stream) {
    buffer += chunk.content;
    await callback(buffer);
    log.debug({ msg: 'Bedrock response received', content: buffer });
  }
  return buffer;
}
