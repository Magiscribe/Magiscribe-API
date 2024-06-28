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
  relativeCoordinates?: number[][];
  textResponse: string;
}

interface ResponseItem {
  coordinateDict: CoordinateDict;
}

function parseMessage(message: IMessage): string {
  if (message.userId) {
    return `User: ${message.response.response}`;
  } else if (message.agentId) {
    if (message.response.type === 'command') {
      try {
        const responseObj = JSON.parse(message.response.response || '');
        const parsedResponse = responseObj.map((item: ResponseItem) => {
          const { coordinateDict } = item;
          const { elementProperties, startCoordinates, relativeCoordinates, textResponse } = coordinateDict;
          
          const result: CoordinateDict = {
            elementProperties,
            startCoordinates,
            textResponse,
            ...(elementProperties.type !== 'freedraw' ? { relativeCoordinates } : {})
          };

          return JSON.stringify(result);
        }).join('\n');

        return `Agent: ${parsedResponse}`;
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

function parseThread(thread: IThread): string {
  const threadHistory = "<ThreadHistory>" + thread.messages.map(parseMessage).filter(Boolean).join('\n') + "</ThreadHistory>"
  return threadHistory;
}

export async function getThreadContext(subscriptionId: string): Promise<string> {
  try {
    const thread = await Thread.findOne({ subscriptionId });
    if (!thread || thread.messages.length === 0) {
      return "<ThreadHistory>This is the first message in the thread</ThreadHistory>";
    }
    return parseThread(thread);
  } catch (error) {
    logger.error({
      msg: 'Failed to retrieve thread',
      error: error instanceof Error ? error.message : String(error),
      subscriptionId
    });
    throw error;
  }
}