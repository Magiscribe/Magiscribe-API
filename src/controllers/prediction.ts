import config from '@/config';
import { OutputReturnMode } from '@/database/models/agent';
import { Agent, Capability } from '@/graphql/codegen';
import { SubscriptionEvent } from '@/graphql/subscription-events';
import log from '@/log';
import { Content, ContentType, makeRequest } from '@/utils/ai/requests';
import {
  addToThread,
  buildPrompt,
  findOrCreateThread,
  getAgent,
  getCapability,
  getHistory,
} from '@/utils/ai/system';
import { pubsubClient } from '@/utils/clients';
import * as utils from '@/utils/code';
import { executeMCPTool, Integration, listMCPTools } from '@/utils/mcpClient';
import { getInquiryIntegrations } from '@/controllers/inquiry';
import { v4 as uuid } from 'uuid';

enum PredictionEventType {
  RECEIVED = 'RECEIVED',
  DATA = 'DATA',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface ReasoningResponse {
  processingSteps: Array<{
    prompt: string;
    context: string;
    capabilityAlias: string;
  }>;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/**
 * Using the reasoning prompt provided in the agent, this function will preprocess and is aimed at
 * providing a more structured approach to the reasoning process. The function will return an array
 * of processing steps, each containing a prompt, capabilityAlias, and any other relevant information
 * required to execute the reasoning the capability.
 * If no reasoning prompt is provided in the agent, this function will return null.
 *
 * @param {Object} variables - Any custom variables that need to be passed to the reasoning prompt and help in the reasoning process.
 * @param {IAgent} agent - The agent object containing reasoning prompt and model information.
 * @returns {Promise<Array<any> | null>} - A promise that resolves to an array of processing steps or null if no reasoning prompt is provided.
 * @throws {Error} - Throws an error if the preprocessing response cannot be parsed as valid JSON.
 */
async function reason(
  variables: { [key: string]: string },
  agent: Agent,
): Promise<ReasoningResponse | null> {
  if (!agent.reasoning) {
    return null;
  }

  const prompt = await buildPrompt(agent.reasoning.prompt, variables);

  const response = await makeRequest({
    content: [
      {
        type: ContentType.TEXT,
        text: prompt,
      },
    ],
    model: agent.reasoning.llmModel,
  });

  const cleanedPreprocessingResponse = utils.cleanCodeBlock(response.content);

  try {
    const parsedResponse = JSON.parse(cleanedPreprocessingResponse);

    log.debug({
      msg: 'Reasoning step token usage',
      tokenUsage: response.tokenUsage,
    });

    return {
      processingSteps: parsedResponse.processingSteps,
      tokenUsage: response.tokenUsage,
    };
  } catch (error) {
    log.error({
      msg: 'Failed to parse cleaned preprocessing response',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Invalid JSON response from preprocessing');
  }
}

async function getSteps(agent: Agent, variables: { [key: string]: string }) {
  const reasoningResult = await reason(variables, agent);

  // If, we have reasoning steps, we need to return an array of steps
  // with the prompt and a capability object that wlll perform the action.
  if (reasoningResult) {
    // With reasoning, initial variables can be optional passed through to the
    // capability.
    const passThroughVariables = agent.reasoning?.variablePassThrough
      ? variables
      : {};

    return {
      steps: (await Promise.all(
        reasoningResult.processingSteps.map(async (step) => ({
          ...passThroughVariables,
          ...step,
          capability: await getCapability(step.capabilityAlias),
        })),
      )) as Array<{ [key: string]: string | Capability }>,
      reasoningTokenUsage: reasoningResult.tokenUsage,
      reasoningContent: reasoningResult.processingSteps,
    };
  }

  // If no reasoning steps are provided, we need to return an array of steps
  // with the prompt and the capability object. This allows agents to be present
  // that do not require reasoning. We automatically pass all variables through to this.
  return {
    steps: agent.capabilities.map((capability) => ({
      ...variables,
      capability,
    })) as Array<{ [key: string]: string | Capability }>,
    reasoningTokenUsage: null,
    reasoningContent: null,
  };
}

/**
 * Executes a single step in the reasoning process.
 * @param step {Object} - The step to execute. Must include a capability.
 * @param eventPublisher {(type: PredictionEventType, data?: string) => Promise<void>} - The function for publishing prediction events.
 * @returns {Promise<string>} - A promise that resolves to the result of the step.
 */
async function executeStep(
  step: {
    [key: string]: string | Capability;
  },
  attachments: Array<Content>,
  eventPublisher: (type: PredictionEventType, data?: string) => Promise<void>,
): Promise<{
  content: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
}> {
  if (!step.capability) {
    throw new Error(`No capability found.`);
  }

  const capability = step.capability as Capability;
  const llmModelAlias = step.llmModelAlias as string | undefined;
  const prompts = capability.prompts?.map((prompt) => prompt?.text);

  // Remove capability from the step variables
  delete step.capability;

  log.debug({
    msg: 'Executing AI prediction step',
    step,
    capability,
  });

  // TODO: Replace with a more structured approach to handling prompts.
  //       E.g., templating engine.
  const prompt = await buildPrompt(
    [...(prompts ?? [])].join('\n').trim(),
    step as { [key: string]: string },
  );

  const response = await makeRequest({
    content: [
      {
        type: ContentType.TEXT,
        text: prompt,
      },
      ...(attachments ?? []),
    ],
    model: llmModelAlias ?? capability.llmModel,
    streaming:
      capability.outputMode === OutputReturnMode.STREAMING_INDIVIDUAL
        ? {
            enabled: true,
            callback: async (content: string) => {
              log.debug({
                msg: 'Streaming AI response chunk received',
                content,
              });
              eventPublisher(PredictionEventType.DATA, content);
            },
          }
        : undefined,
  });

  const result = response.content;
  let finalResult: string;

  if (
    [
      OutputReturnMode.SYNCHRONOUS_EXECUTION_AGGREGATE,
      OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL,
    ].includes(capability.outputMode as OutputReturnMode)
  ) {
    const executedResult = await utils.executePythonCode(
      utils.cleanCodeBlock(result),
    );

    if (
      capability.outputMode === OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL
    ) {
      eventPublisher(PredictionEventType.DATA, executedResult);
    }

    finalResult = utils.applyFilter(executedResult, capability.outputFilter);
  } else {
    finalResult = utils.applyFilter(result, capability.outputFilter);
  }

  return {
    content: finalResult,
    tokenUsage: response.tokenUsage,
    model: llmModelAlias ?? capability.llmModel,
  };
}

/**
 * Executes a series of steps in parallel and returns any non-null results.
 * @param steps {Array<{ [key: string]: string | Capability }>} - The steps to execute.
 * @param eventPublisher {(type: PredictionEventType, data?: string) => Promise<void>} - The function for publishing prediction events.
 * @returns {Promise<string>} - A promise that resolves to a JSON string of the results.
 */
async function executeSteps(
  steps: Array<{
    [key: string]: string | Capability;
  }>,
  attachments: Array<Content>,
  eventPublisher: (type: PredictionEventType, data?: string) => Promise<void>,
): Promise<{
  content: string[];
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
}> {
  const results = await Promise.all(
    steps.map((step) => executeStep(step, attachments, eventPublisher)),
  );

  // Aggregate token usage from all steps
  const totalTokenUsage = results.reduce(
    (acc, result) => ({
      inputTokens: acc.inputTokens + result.tokenUsage.inputTokens,
      outputTokens: acc.outputTokens + result.tokenUsage.outputTokens,
      totalTokens: acc.totalTokens + result.tokenUsage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );

  return {
    content: results.map((r) => r.content).filter((item) => item !== null),
    tokenUsage: totalTokenUsage,
    model: results[results.length - 1].model, // Use the last model used in the chain
  };
}

/**
 * Creates a function for publishing prediction events.
 * @param eventId Unique identifier for the event
 * @param subscriptionId Identifier for the associated subscription
 * @returns A function that publishes prediction events
 */
function createEventPublisher(eventId: string, subscriptionId: string) {
  return async (
    type: PredictionEventType,
    result?: string,
    tokenUsage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    },
  ) => {
    const contextMap = {
      RECEIVED: 'User prompt received',
      DATA: 'Prediction data received',
      SUCCESS: 'Prediction generation successful',
      ERROR: 'Prediction generation failed',
      DEBUG: 'Debug information. Not present in production',
    };

    if (type === PredictionEventType.DEBUG && config.environment !== 'dev') {
      throw new Error('Debug events are not allowed in production');
    }

    log.trace({
      msg: 'Publishing prediction event',
      eventId,
      subscriptionId,
      type,
      result,
      tokenUsage,
      context: contextMap[type],
    });
    return pubsubClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
      predictionAdded: {
        id: eventId,
        subscriptionId,
        result,
        type,
        context: contextMap[type],
        tokenUsage,
      },
    });
  };
}

/**
 * Generates a prediction based on the given agent and user input.
 * @param {Object} params - The parameters for prediction generation.
 * @param {Object} params.auth - Authentication information.
 * @param {string} params.auth.sub - The subject (user ID) from the auth token.
 * @param {string} params.subscriptionId - The ID of the subscription.
 * @param {string} params.agentId - The ID of the agent to use.
 * @param {Object} params.variables - Key-value pairs of variables for the prediction.
 * @param {Array} params.attachments - Attachments to include in the prediction.
 * @param {string} params.inquiryId - Optional inquiry ID to enable MCP integrations.
 * @returns {Promise<void>}
 */
export async function generatePrediction({
  auth,
  subscriptionId,
  agentId,
  inquiryId,
  variables,
  attachments,
  inquiryId,
}: {
  auth?: { sub?: string };
  subscriptionId: string;
  agentId: string;
  inquiryId?: string;
  variables: Record<string, string>;
  attachments: Array<Content>;
  inquiryId?: string;
}): Promise<void> {
  const publishEvent = createEventPublisher(uuid(), subscriptionId);

  try {
    await publishEvent(PredictionEventType.RECEIVED);
    log.info({ msg: 'Prediction generation started', auth, variables });

    const agent = await getAgent(agentId);
    if (!agent) throw new Error(`No agent found for ID: ${agentId}`);

    const thread = await findOrCreateThread(subscriptionId, inquiryId);
    await addToThread(thread, auth?.sub, variables, true);

    log.debug({
      msg: 'memoryEnabled',
      capabilities: agent.memoryEnabled,
    });
    if (agent.memoryEnabled) {
      variables.history = getHistory(thread);
      log.debug({
        msg: 'history',
        history: variables.history,
      });
    }

    // MCP Integration support - if inquiryId is provided, get available tools
    let mcpTools: Array<{ integration: Integration; tools: any[] }> = [];
    if (inquiryId) {
      try {
        log.debug({
          msg: 'MCP enabled for inquiry',
          inquiryId,
        });

        const availableIntegrations = await getInquiryIntegrations(inquiryId);
        
        for (const integration of availableIntegrations) {
          try {
            const tools = await listMCPTools(integration);
            mcpTools.push({ integration, tools });
            
            log.debug({
              msg: 'Listed tools for integration',
              integrationName: integration.name,
              toolCount: tools.length,
            });
          } catch (error) {
            log.warn({
              msg: 'Failed to list tools for integration',
              integrationName: integration.name,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Add MCP tools to variables so the AI can see them
        if (mcpTools.length > 0) {
          const toolsDescription = mcpTools
            .map(({ integration, tools }) => 
              `Integration: ${integration.name}\n` +
              tools.map(tool => 
                `  - ${tool.name}: ${tool.description}`
              ).join('\n')
            )
            .join('\n\n');

          variables.mcpTools = `${toolsDescription}

To execute a tool, respond with JSON in this format (enclosed in backticks):
\`\`\`json
{
  "command": "tool_name",
  "args": {
    "parameter": "value"
  }
}
\`\`\`

Example:
\`\`\`json
{
  "command": "jira_search", 
  "args": {
    "jql": "project = MYPROJ",
    "limit": 10
  }
}
\`\`\`

Alternatively, you can include the JSON directly in your response:
{
  "command": "jira_search", 
  "args": {
    "jql": "order by created DESC",
    "limit": 10
  }
}`;
          
          log.debug({
            msg: 'Added MCP tools to variables',
            toolCount: mcpTools.reduce((sum, t) => sum + t.tools.length, 0),
          });
        }
      } catch (error) {
        log.warn({
          msg: 'Failed to setup MCP tools',
          inquiryId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const steps = await getSteps(agent, variables);
    const {
      content: result,
      tokenUsage,
      model,
    } = await executeSteps(steps, attachments, publishEvent);

    // If MCP tools are available, check if the AI wants to execute any tool
    let finalResult = JSON.stringify(result);
    if (inquiryId && mcpTools.length > 0) {
      try {
        // Try to parse the result to see if it contains MCP tool execution instructions
        let toolExecutionRequest: {
          integrationName?: string;
          toolName?: string;
          arguments?: Record<string, any>;
        } | null = null;

        // Helper function to extract tool execution from various formats
        const extractToolExecution = (content: string): any => {
          // Try direct JSON parsing first
          try {
            return JSON.parse(content);
          } catch {
            // Remove newlines and extra whitespace for easier parsing
            const normalizedContent = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            
            // Try parsing the normalized content
            try {
              return JSON.parse(normalizedContent);
            } catch {
              // If that fails, look for JSON objects with proper brace matching
              const findJsonObject = (text: string): string | null => {
                let braceCount = 0;
                let start = -1;
                
                for (let i = 0; i < text.length; i++) {
                  if (text[i] === '{') {
                    if (start === -1) start = i;
                    braceCount++;
                  } else if (text[i] === '}') {
                    braceCount--;
                    if (braceCount === 0 && start !== -1) {
                      return text.substring(start, i + 1);
                    }
                  }
                }
                return null;
              };
              
              // Look for JSON objects in both original and normalized content
              const candidates = [content, normalizedContent];
              
              for (const candidate of candidates) {
                const jsonObject = findJsonObject(candidate);
                if (jsonObject) {
                  try {
                    const parsed = JSON.parse(jsonObject);
                    // Verify it looks like a tool execution request
                    if (parsed.command || parsed.toolName || parsed.tool_name) {
                      return parsed;
                    }
                  } catch {
                    continue;
                  }
                }
              }
              
              // Last resort: pattern matching with better regex
              const patterns = [
                // Look for command pattern with nested args
                /\{\s*"command"\s*:\s*"[^"]+"\s*,\s*"args"\s*:\s*\{[^}]*\}\s*\}/g,
                // Look for toolName pattern
                /\{\s*"toolName"\s*:\s*"[^"]+"\s*,\s*"args"\s*:\s*\{[^}]*\}\s*\}/g,
                // Look for tool_name pattern
                /\{\s*"tool_name"\s*:\s*"[^"]+"\s*,\s*"args"\s*:\s*\{[^}]*\}\s*\}/g,
              ];
              
              for (const pattern of patterns) {
                const matches = normalizedContent.match(pattern);
                if (matches) {
                  for (const match of matches) {
                    try {
                      const parsed = JSON.parse(match);
                      if (parsed.command || parsed.toolName || parsed.tool_name) {
                        return parsed;
                      }
                    } catch {
                      continue;
                    }
                  }
                }
              }
              
              return null;
            }
          }
        };

        // Parse each result item to look for tool execution requests
        for (const resultItem of result) {
          const cleanedResult = utils.cleanCodeBlock(resultItem);
          
          // First try to parse the cleaned result directly
          let parsed = extractToolExecution(cleanedResult);
          
          // If that fails and the result looks like a JSON array, try to parse each element
          if (!parsed && cleanedResult.startsWith('[')) {
            try {
              const arrayParsed = JSON.parse(cleanedResult);
              if (Array.isArray(arrayParsed)) {
                // Look through each array element for tool execution
                for (const item of arrayParsed) {
                  if (typeof item === 'string') {
                    const extracted = extractToolExecution(item);
                    if (extracted) {
                      parsed = extracted;
                      break;
                    }
                  } else if (typeof item === 'object' && item !== null) {
                    if (item.command || item.toolName || item.tool_name) {
                      parsed = item;
                      break;
                    }
                  }
                }
              }
            } catch {
              // Continue with other parsing methods
            }
          }
          
          if (!parsed) {
            log.debug({
              msg: 'No tool execution JSON found in result item',
              cleanedResult: cleanedResult.substring(0, 200),
            });
            continue;
          }

          // Check for different response formats
          if (parsed && parsed.integrationName && parsed.toolName) {
            // Format 1: Direct integration/tool specification
            toolExecutionRequest = parsed;
            break;
          } else if (parsed && parsed.command) {
            // Format 2: Command-based format (what the AI is using)
            const commandName = parsed.command;
            
            // Find which integration contains this tool
            const foundTool = mcpTools.find(({ tools }) => 
              tools.some(tool => tool.name === commandName)
            );
            
            if (foundTool) {
              toolExecutionRequest = {
                integrationName: foundTool.integration.name,
                toolName: commandName,
                arguments: parsed.args || parsed.arguments || {},
              };
              break;
            }
          } else if (parsed && (parsed.toolName || parsed.tool_name)) {
            // Format 3: Tool name with optional integration
            const toolName = parsed.toolName || parsed.tool_name;
            const integrationName = parsed.integrationName || parsed.integration_name;
            
            if (integrationName) {
              toolExecutionRequest = {
                integrationName,
                toolName,
                arguments: parsed.args || parsed.arguments || {},
              };
              break;
            } else {
              // Find which integration contains this tool
              const foundTool = mcpTools.find(({ tools }) => 
                tools.some(tool => tool.name === toolName)
              );
              
              if (foundTool) {
                toolExecutionRequest = {
                  integrationName: foundTool.integration.name,
                  toolName,
                  arguments: parsed.args || parsed.arguments || {},
                };
                break;
              }
            }
          }
        }

        // If we found a tool execution request, execute it
        if (toolExecutionRequest) {
          await publishEvent(PredictionEventType.DATA, `Executing ${toolExecutionRequest.toolName} on ${toolExecutionRequest.integrationName}...`);
          
          // Find the matching integration and tool
          const matchingTool = mcpTools.find(({ integration, tools }) => 
            integration.name === toolExecutionRequest!.integrationName &&
            tools.some(tool => tool.name === toolExecutionRequest!.toolName)
          );

          if (matchingTool) {
            const toolResult = await executeMCPTool(
              matchingTool.integration,
              toolExecutionRequest.toolName!,
              toolExecutionRequest.arguments || {}
            );

            if (toolResult.success) {
              finalResult = JSON.stringify({
                originalResponse: result,
                toolExecution: {
                  integrationName: toolExecutionRequest.integrationName,
                  toolName: toolExecutionRequest.toolName,
                  arguments: toolExecutionRequest.arguments,
                  result: toolResult.result,
                },
              }, null, 2);
              
              await publishEvent(PredictionEventType.DATA, 'Tool executed successfully');
            } else {
              finalResult = JSON.stringify({
                originalResponse: result,
                toolExecution: {
                  integrationName: toolExecutionRequest.integrationName,
                  toolName: toolExecutionRequest.toolName,
                  error: toolResult.error,
                },
              }, null, 2);
              
              await publishEvent(PredictionEventType.DATA, `Tool execution failed: ${toolResult.error}`);
            }

            log.info({
              msg: 'MCP tool execution completed',
              integrationName: toolExecutionRequest.integrationName,
              toolName: toolExecutionRequest.toolName,
              success: toolResult.success,
            });
          } else {
            log.warn({
              msg: 'Requested MCP tool not found',
              integrationName: toolExecutionRequest.integrationName,
              toolName: toolExecutionRequest.toolName,
              availableTools: mcpTools.map(t => ({ 
                integration: t.integration.name, 
                tools: t.tools.map(tool => tool.name) 
              })),
            });
          }
        } else {
          log.debug({
            msg: 'No tool execution request found in AI response',
            resultCount: result.length,
          });
        }
      } catch (error) {
        log.warn({
          msg: 'Failed to process MCP tool execution',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await publishEvent(PredictionEventType.SUCCESS, finalResult);
    await addToThread(
      thread,
      agent.id,
      utils.applyFilter(finalResult, agent.outputFilter),
      false,
      tokenUsage,
      model,
    );

    log.info({
      msg: 'Prediction generation successful',
      auth,
      result: finalResult,
      tokenUsage,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log.warn({ msg: 'Prediction generation failed', error: errorMessage });
    await publishEvent(PredictionEventType.ERROR, errorMessage);
  }
}
