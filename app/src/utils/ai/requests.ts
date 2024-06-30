import log from '@log';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { LLM_MODELS_VERSION } from './models';

/**
 * Sends a request to the Bedrock model and returns the response.
 * @param {string} params.prompt - The prompt string to send to the model.
 * @param {string} params.model - The name of the LLM we are using
 * @param {Object} [params.streaming] - Streaming options
 * @param {boolean} params.streaming.enabled - Whether to use streaming mode
 * @param {Function} params.streaming.callback - Callback function for streaming mode
 * @returns {Promise<string>} The response from the model.
 */
export async function makeRequest({
  prompt,
  model,
  streaming = { enabled: false },
}: {
  prompt: string;
  model: string;
  streaming?: {
    enabled: boolean;
    callback?: (content: string) => Promise<void>;
  };
}): Promise<string> {
  const chat = new BedrockChat({
    region: 'us-east-1',
    model: LLM_MODELS_VERSION[model].id,
    maxTokens: 4096,
    temperature: 0,
  });

  log.debug({
    msg: 'Sending AI request...',
    prompt,
    streaming,
  });

  if (streaming.enabled) {
    if (!streaming.callback) {
      throw new Error('Callback function is required for streaming mode');
    }

    const stream = await chat.stream(prompt);
    let buffer = '';
    for await (const chunk of stream) {
      buffer += chunk.content;
      await streaming.callback(buffer);
      log.debug({ msg: 'AI response chunk received', content: buffer });
    }
    return buffer;
  } else {
    const completion = await chat.invoke(prompt);
    log.debug({ msg: 'AI response received', content: completion.content });
    return completion.content as string;
  }
}
