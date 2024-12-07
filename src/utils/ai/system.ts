import { Agent, Capability } from '@database/models/agent';
import {
  IThread,
  MessageResponseTypes,
  Thread,
} from '@database/models/message';
import { Agent as IAgent, Capability as ICapability } from '@graphql/codegen';
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
 * @returns {Promise<void>}
 */
export async function addMessageToThread(
  thread: Document,
  senderId: string,
  message: string,
  isUser: boolean,
): Promise<void> {
  await thread.updateOne({
    $push: {
      messages: {
        [isUser ? 'userId' : 'agentId']: senderId,
        response: {
          type: isUser
            ? MessageResponseTypes.Text
            : MessageResponseTypes.Command,
          response: message,
        },
      },
    },
  });
}

export async function getHistory(thread: IThread) {
  const history = thread.messages
    .map(
      (message) =>
        `${message.userId ? 'User' : 'Agent'}: ${message.response.response}`,
    )
    .join('\n');
  return history;
}
