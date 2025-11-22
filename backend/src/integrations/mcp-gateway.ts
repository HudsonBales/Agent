import { IntegrationContext, ToolDescription, ToolExecution } from "../types";
import { IntegrationConnector } from "./connectors/base";
import { NotionConnector } from "./connectors/notion-connector";
import { SlackConnector } from "./connectors/slack-connector";
import { StripeConnector } from "./connectors/stripe-connector";
import { SupabaseConnector } from "./connectors/supabase-connector";
import { GitHubConnector } from "./connectors/github-connector";
import { MCPClient } from "./mcp-client";
import { DataStore } from "../data/store";
import { createAppsWidgetMetadata } from "../apps/apps-sdk";

interface MCPIntegration {
  id: string;
  name: string;
  client: MCPClient;
}

export class MCPGateway {
  private connectors = new Map<string, IntegrationConnector>();
  private mcpIntegrations = new Map<string, MCPIntegration>();

  constructor(private store: DataStore) {
    // Register built-in connectors
    [new StripeConnector(), new SupabaseConnector(), new SlackConnector(), new NotionConnector(), new GitHubConnector()].forEach(
      (connector) => this.registerConnector(connector)
    );

    // Register MCP integrations
    this.registerMCPIntegration("stripe", "Stripe", "npx", ["-y", "@modelcontextprotocol/server-stripe"]);
    this.registerMCPIntegration("supabase", "Supabase", "npx", ["-y", "@modelcontextprotocol/server-supabase"]);
  }

  private registerConnector(connector: IntegrationConnector) {
    this.connectors.set(connector.id, connector);
  }

  private async registerMCPIntegration(id: string, name: string, command: string, args: string[]) {
    const client = new MCPClient(command, args);
    try {
      await client.connect();
      this.mcpIntegrations.set(id, { id, name, client });
      console.log(`MCP integration ${name} connected successfully`);
    } catch (error) {
      console.error(`Failed to connect MCP integration ${name}:`, error);
    }
  }

  async listTools(): Promise<ToolDescription[]> {
    const descriptors: ToolDescription[] = [];

    // Add tools from built-in connectors
    for (const connector of this.connectors.values()) {
      connector.tools.forEach((tool) =>
        descriptors.push({
          id: tool.id,
          name: `${connector.name} · ${tool.name}`,
          summary: tool.description,
          namespace: connector.namespace,
          example: JSON.stringify(tool.args),
          version: "1.0",
          capabilities: ["read", "write"]
        })
      );
    }

    // Add tools from MCP integrations
    for (const integration of this.mcpIntegrations.values()) {
      try {
        const tools = await integration.client.listTools();
        descriptors.push(...tools);
      } catch (error) {
        console.error(`Failed to list tools for ${integration.name}:`, error);
      }
    }

    return descriptors;
  }

  async execute(
    context: IntegrationContext,
    toolId: string,
    args: Record<string, unknown>
  ): Promise<ToolExecution> {
    // Try built-in connectors first
    const connector = this.findConnector(toolId);
    if (connector) {
      const enrichedContext = this.enrichContext(context, connector);
      const result = await connector.execute(toolId, args, enrichedContext);
      const metadata = createAppsWidgetMetadata({
        workspaceId: context.workspaceId,
        actorId: context.actorId,
        source: "connector",
        toolId,
        payload: result
      });
      const payload: ToolExecution = {
        toolId,
        result
      };
      if (metadata) {
        payload.metadata = metadata;
      }
      return payload;
    }

    // Try MCP integrations
    const mcpResult = await this.executeMCPTool(context, toolId, args);
    if (mcpResult) {
      return mcpResult;
    }

    throw new Error(`No connector or MCP integration registered for tool ${toolId}`);
  }

  private findConnector(toolId: string) {
    for (const connector of this.connectors.values()) {
      if (connector.tools.some((tool) => tool.id === toolId)) {
        return connector;
      }
    }
    return undefined;
  }

  private enrichContext(context: IntegrationContext, connector: IntegrationConnector): IntegrationContext {
    if (!this.store) {
      return context;
    }
    const connection = this.store.getIntegrationConnection(context.workspaceId, connector.id);
    if (connector.requiresConnection && (!connection || !connection.connected)) {
      throw new Error(`${connector.name} is not connected for workspace ${context.workspaceId}`);
    }
    if (connection) {
      return { ...context, connection };
    }
    return context;
  }

  private async executeMCPTool(
    context: IntegrationContext,
    toolId: string,
    args: Record<string, unknown>
  ): Promise<ToolExecution | null> {
    for (const integration of this.mcpIntegrations.values()) {
      try {
        // Check if this integration has the tool
        const tools = await integration.client.listTools();
        if (tools.some(tool => tool.id === toolId)) {
          const result = await integration.client.callTool(toolId, args);
          const metadata = createAppsWidgetMetadata({
            workspaceId: context.workspaceId,
            actorId: context.actorId,
            source: "mcp",
            toolId,
            payload: result
          });
          const payload: ToolExecution = {
            toolId,
            result
          };
          if (metadata) {
            payload.metadata = metadata;
          }
          return payload;
        }
      } catch (error) {
        console.error(`Failed to execute tool ${toolId} on ${integration.name}:`, error);
      }
    }
    return null;
  }
}
