import { Agent, Capability } from '@/database/models/agent';
import {
  IThread,
  MessageResponseTypes,
  Thread,
} from '@/database/models/message';
import { Agent as IAgent, Capability as ICapability } from '@/graphql/codegen';
import { PromptTemplate } from '@langchain/core/prompts';
import { Document } from 'mongoose';

/**
 * Builds a prompt by formatting a template with provided properties.
 *
 * @param {string} template - The prompt template string.
 * @param {Record<string, string>} props - An object containing key-value pairs to fill the template.
 * @returns {Promise<string>} A promise that resolves to the formatted prompt string.
 */
export async function buildPrompt(
  template: string,
  props: Record<string, string>,
): Promise<string> {
  const prompt = new PromptTemplate({
    template,
    inputVariables: Object.keys(props),
    templateFormat: 'mustache',
  });
  return await prompt.format(props);
}

/**
 * Retrieves an agent by ID.
 * @param id {string} - The ID of the agent to retrieve.
 * @returns {Promise<Agent>} The agent with the provided ID, or null if not found.
 */
export async function getAgent(id: string): Promise<IAgent | null> {
  return await Agent.findOne({ _id: id }).populate({
    path: 'capabilities',
    populate: { path: 'prompts' },
  });
}

/**
 * Retrieves an agent by alias.
 * @param alias {string} - The alias of the agent to retrieve.
 * @returns {Promise<ICapability>} The agent with the provided alias, or null if not found.
 */
export async function getCapability(
  alias: string,
): Promise<ICapability | null> {
  return await Capability.findOne({ alias }).populate('prompts');
}

export async function findOrCreateThread(subscriptionId: string) {
  return await Thread.findOneAndUpdate(
    { subscriptionId },
    { $setOnInsert: { messages: [] } },
    { upsert: true, new: true },
  );
}

/**
 * Adds a message to a thread in the database.
 *
 * @param {mongoose.Document} thread - The mongoose document representing the thread.
 * @param {string} senderId - The ID of the sender (user or agent).
 * @param {string} message - The content of the message.
 * @param {boolean} isUser - Whether the sender is a user (true) or an agent (false).
 * @param {Object} [tokens] - An optional object containing token usage information.
 * @param {number} tokens.inputTokens - The number of input tokens used.
 * @param {number} tokens.outputTokens - The number of output tokens used.
 * @param {number} tokens.totalTokens - The total number of tokens used.
 * @returns {Promise<void>}
 */
export async function addToThread(
  thread: Document,
  senderId: string | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  isUser: boolean,
  tokens?: { inputTokens: number; outputTokens: number; totalTokens: number },
  model?: string,
): Promise<void> {
  await thread.updateOne({
    $push: {
      messages: {
        userId: isUser ? senderId : null,
        agentId: isUser ? null : senderId,
        response: {
          type: isUser
            ? MessageResponseTypes.Text
            : MessageResponseTypes.Command,
          response,
        },
        model: model,
        tokens: tokens,
      },
    },
  });
}

/**
 * Retrieves the history of a thread and formats it as a string.
 * @param thread {IThread} - The thread to retrieve the history for.
 * @returns {string} A promise that resolves to the formatted history string.
 */
export function getHistory(thread: IThread): string {
  const history = thread.messages
    .map((message) => {
      let response: string;
      if (typeof message.response.response === 'string') {
        response = message.response.response;
      } else {
        response = JSON.stringify(message.response.response);
      }
      return `${message.userId ? 'User' : 'Agent'}: ${response}`;
    })
    .join('\n');
  return history;
}
