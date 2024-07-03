import { Agent, Capability, IAgent, ICapability } from '@database/models/agent';
import { MessageResponseTypes, Thread } from '@database/models/message';
import { PromptTemplate } from '@langchain/core/prompts';

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
 * Adds a user message to a thread in the database.
 *
 * @param {mongoose.Document} thread - The mongoose document representing the thread.
 * @param {string} userId - The ID of the user sending the message.
 * @param {string} userPrompt - The content of the user's message.
 * @param {object} MessageResponseTypes - An object containing message response type constants.
 * @returns {Promise<void>}
 */
export async function addUserMessage(thread, userId, userPrompt) {
  await thread.updateOne({
    $push: {
      messages: {
        userId: userId,
        response: {
          type: MessageResponseTypes.Text,
          response: userPrompt,
        },
      },
    },
  });
}

/**
 * Adds a user message to a thread in the database.
 *
 * @param {mongoose.Document} thread - The mongoose document representing the thread.
 * @param {string} userId - The ID of the user sending the message.
 * @param {string} userPrompt - The content of the user's message.
 * @param {object} MessageResponseTypes - An object containing message response type constants.
 * @returns {Promise<void>}
 */
export async function addAgentMessage(
  thread,
  agentId: string,
  response: string,
) {
  await thread.updateOne({
    $push: {
      messages: {
        agentId: agentId,
        response: {
          type: MessageResponseTypes.Command,
          response,
        },
      },
    },
  });
}
