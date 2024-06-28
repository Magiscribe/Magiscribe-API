import { Agent, Capability, IAgent, ICapability } from '@database/models/agent';
import { Thread, IThread, IMessage } from '@database/models/message';
import logger from '@log';
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

interface CoordinateDict {
  elementProperties: {
    type: string;
    [key: string]: string;
  };
  startCoordinates: number[];
  textResponse: string;
}

interface ResponseItem {
  coordinateDict: CoordinateDict;
}

function parseMessage(message: IMessage, parseInstructions?: string | null): string {
  if (message.userId) {
    return `User: ${message.response.response}`;
  } else if (message.agentId) {
    if (message.response.type === 'command') {
      try {
        const responseObj = JSON.parse(message.response.response || '');
        
        if (parseInstructions) {
          // Use the parsing instructions if provided
          const parsedResponse = parseWithInstructions(responseObj, parseInstructions);
          return `Agent: ${JSON.stringify(parsedResponse)}`;
        } else {
          // If no instructions, return the full response
          return `Agent: ${JSON.stringify(responseObj)}`;
        }
      } catch (error) {
        logger.warn('Failed to parse agent response', error);
        return `Agent: ${message.response.response}`;
      }
    } else {
      return `Agent: ${message.response.response}`;
    }
  }
  return '';
}

// Define utility types for JSON-like structures
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
type JSONObject = { [key: string]: JSONValue };

function parseWithInstructions<T extends JSONObject>(responseObj: T | T[], instructions: string): Partial<T> | Partial<T>[] {
  const paths = instructions.split(',');
  
  if (Array.isArray(responseObj)) {
    return responseObj.map(item => parseItem(item, paths));
  } else {
    return parseItem(responseObj, paths);
  }
}

function parseItem<T extends JSONObject>(item: T, paths: string[]): Partial<T> {
  const result: Partial<T> = {};
  
  paths.forEach(path => {
    const keys = path.split('.');
    let value: unknown = item;
    let currentPath = '';
    
    for (const key of keys) {
      currentPath += (currentPath ? '.' : '') + key;
      
      if (typeof value === 'object' && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        logger.warn(`Invalid path: ${currentPath}`);
        value = undefined;
        break;
      }
    }
    
    if (value !== undefined) {
      const lastKey = keys[keys.length - 1] as keyof T;
      result[lastKey] = value as T[typeof lastKey];
    }
  });

  return result;
}

function parseThread(thread: IThread, parseInstructions?: string | null): string {
  const threadHistory = thread.messages
    .map(message => parseMessage(message, parseInstructions))
    .filter(Boolean)
    .join('\n');
  return `<ThreadHistory>${threadHistory}</ThreadHistory>`;
}

export async function getThreadContext(subscriptionId: string, parseInstructions?: string | null): Promise<string> {
  try {
    const thread = await Thread.findOne({ subscriptionId });
    if (!thread || thread.messages.length === 0) {
      return "<ThreadHistory>This is the first message in the thread</ThreadHistory>";
    }
    return parseThread(thread, parseInstructions);
  } catch (error) {
    logger.error({
      msg: 'Failed to retrieve thread',
      error: error instanceof Error ? error.message : String(error),
      subscriptionId
    });
    throw error;
  }
}