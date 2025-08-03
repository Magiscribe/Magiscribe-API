import log from '@/log';
import { withExponentialBackoff } from '@/utils/exponential-backoff';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { HumanMessage } from '@langchain/core/messages';

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

export interface AIResponse {
  content: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
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
}): Promise<AIResponse> {
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

  // Helper function to estimate tokens from text content
  // Rough estimation: ~4 characters per token (adjustable)
  const estimateTokens = (text: string, charsPerToken: number = 4): number => {
    return Math.ceil(text.length / charsPerToken);
  };

  // Extract all text content from the content array for input token calculation
  const inputText = content
    .filter((item) => item.type === ContentType.TEXT && item.text)
    .map((item) => item.text)
    .join(' ');

  if (streaming.enabled) {
    if (!streaming.callback) {
      throw new Error('Callback function is required for streaming mode');
    }
    return await withExponentialBackoff(async () => {
      const stream = await chat.stream([message]);
      let buffer = '';
      for await (const chunk of stream) {
        buffer += chunk.content;
        await streaming.callback!(chunk.content as string);
        log.debug({ msg: 'AI response chunk received', content: buffer });
      }

      const inputTokens = estimateTokens(inputText);
      const outputTokens = estimateTokens(buffer);

      return {
        content: buffer,
        tokenUsage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      };
    });
  } else {
    return await withExponentialBackoff(async () => {
      const completion = await chat.invoke([message]);
      log.debug({ msg: 'AI response received', content: completion.content });

      const inputTokens = estimateTokens(inputText);
      const outputTokens = estimateTokens(completion.content as string);

      return {
        content: completion.content as string,
        tokenUsage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      };
    });
  }
}
