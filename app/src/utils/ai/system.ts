import { Agent, Capability, IAgent, ICapability } from '@database/models/agent';

/**
 * Retrieves an agent by ID.
 * @param id {string} - The ID of the agent to retrieve.
 * @returns {Promise<Agent>} The agent with the provided ID, or null if not found.
 */
export async function getAgent(id: string): Promise<IAgent | null> {
  return await Agent.findOne({ _id: id });
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
