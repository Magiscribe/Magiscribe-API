import log from '@/log';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export interface Integration {
  name: string;
  description: string;
  type: string;
  config: {
    serverUrl: string;
    auth?: {
      apiKey?: string;
    };
  };
}

export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

/**
 * Creates an MCP client for a given integration
 * @param integration The integration configuration
 * @returns Promise<Client> The MCP client instance
 */
export async function createMCPClient(integration: Integration): Promise<Client> {
  log.info({
    message: 'Creating MCP client',
    integrationName: integration.name,
  });

  try {
    // Only SSE transport is supported
    const transport = new SSEClientTransport(new URL(integration.config.serverUrl));

    const client = new Client({
      name: integration.name,
      version: '1.0.0',
    }, {
      capabilities: {}
    });

    await client.connect(transport);

    log.info({
      message: 'MCP client connected successfully',
      integrationName: integration.name,
    });

    return client;
  } catch (error) {
    log.error({
      message: 'Failed to create MCP client',
      integrationName: integration.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Lists available tools from an MCP integration
 * @param integration The integration configuration
 * @returns Promise<MCPTool[]> Array of available tools
 */
export async function listMCPTools(integration: Integration): Promise<MCPTool[]> {
  let client: Client | null = null;

  try {
    client = await createMCPClient(integration);
    
    const toolsResponse = await client.listTools();
    
    const tools = toolsResponse.tools.map(tool => ({
      name: tool.name,
      description: tool.description || '',
      inputSchema: tool.inputSchema || {},
    }));

    log.info({
      message: 'Listed MCP tools',
      integrationName: integration.name,
      toolCount: tools.length,
    });

    return tools;
  } catch (error) {
    log.error({
      message: 'Failed to list MCP tools',
      integrationName: integration.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (disconnectError) {
        log.warn({
          message: 'Failed to disconnect MCP client',
          integrationName: integration.name,
          error: disconnectError instanceof Error ? disconnectError.message : 'Unknown error',
        });
      }
    }
  }
}

/**
 * Executes a tool using the MCP client
 * @param integration The integration configuration
 * @param toolName The name of the tool to execute
 * @param args The arguments to pass to the tool
 * @returns Promise<ToolExecutionResult> The execution result
 */
export async function executeMCPTool(
  integration: Integration,
  toolName: string,
  args: Record<string, any>
): Promise<ToolExecutionResult> {
  let client: Client | null = null;

  log.info({
    message: 'Executing MCP tool',
    integrationName: integration.name,
    toolName,
    args,
  });

  try {
    client = await createMCPClient(integration);
  
    log.debug({
      message: 'MCP client created for tool execution',
      integrationName: integration.name,
      toolName: toolName,
      arguments: args,
    });
    
    const result = await client.callTool({
      name: toolName,
      arguments: args,
    });

    log.info({
      message: 'MCP tool executed successfully',
      integrationName: integration.name,
      toolName,
      result,
    });

    return {
      success: true,
      result: result.content,
    };
  } catch (error) {
    log.error({
      message: 'Failed to execute MCP tool',
      integrationName: integration.name,
      toolName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (disconnectError) {
        log.warn({
          message: 'Failed to disconnect MCP client',
          integrationName: integration.name,
          error: disconnectError instanceof Error ? disconnectError.message : 'Unknown error',
        });
      }
    }
  }
}

/**
 * Tests the connection to an MCP integration
 * @param integration The integration configuration
 * @returns Promise<boolean> Whether the connection was successful
 */
export async function testMCPConnection(integration: Integration): Promise<boolean> {
  let client: Client | null = null;

  try {
    client = await createMCPClient(integration);
    
    // Try to list tools as a connection test
    await client.listTools();

    log.info({
      message: 'MCP connection test successful',
      integrationName: integration.name,
    });

    return true;
  } catch (error) {
    log.error({
      message: 'MCP connection test failed',
      integrationName: integration.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return false;
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (disconnectError) {
        log.warn({
          message: 'Failed to close MCP client during test',
          integrationName: integration.name,
          error: disconnectError instanceof Error ? disconnectError.message : 'Unknown error',
        });
      }
    }
  }
}
