import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { HumanMessage } from '@langchain/core/messages';
import log from '@log';

import { LLM_MODELS_VERSION } from './models';

export enum ContentType {
  TEXT = 'text',
  IMAGE_URL = 'image_url',
}

export interface Content {
  type: ContentType;
  image_url?: {
    url: string;
  };
  text?: string;
}

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
  content,
  model,
  streaming = { enabled: false },
}: {
  content: Array<Content>;
  model: string;
  streaming?: {
    enabled: boolean;
    callback?: (content: string) => Promise<void>;
  };
}): Promise<string> {
  const chat = new BedrockChat({
    region: LLM_MODELS_VERSION[model].region,
    model: LLM_MODELS_VERSION[model].id,
    maxTokens: 4096,
    temperature: 0,
  });

  const message = new HumanMessage({
    content,
  });

  log.debug({
    msg: 'Sending AI request...',
    message,
    streaming,
  });

  if (streaming.enabled) {
    if (!streaming.callback) {
      throw new Error('Callback function is required for streaming mode');
    }

    const stream = await chat.stream([message]);
    let buffer = '';
    for await (const chunk of stream) {
      buffer += chunk.content;
      await streaming.callback(chunk.content as string);
      log.debug({ msg: 'AI response chunk received', content: buffer });
    }
    return buffer;
  } else {
    const completion = await chat.invoke([message]);
    log.debug({ msg: 'AI response received', content: completion.content });
    return completion.content as string;
  }
}
