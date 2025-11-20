import { IntegrationContext, ToolDescription } from "../types";
import { IntegrationConnector } from "./connectors/base";
import { NotionConnector } from "./connectors/notion-connector";
import { SlackConnector } from "./connectors/slack-connector";
import { StripeConnector } from "./connectors/stripe-connector";
import { SupabaseConnector } from "./connectors/supabase-connector";

export class MCPGateway {
  private connectors = new Map<string, IntegrationConnector>();

  constructor() {
    [new StripeConnector(), new SupabaseConnector(), new SlackConnector(), new NotionConnector()].forEach(
      (connector) => this.registerConnector(connector)
    );
  }

  private registerConnector(connector: IntegrationConnector) {
    this.connectors.set(connector.id, connector);
  }

  listTools(): ToolDescription[] {
    const descriptors: ToolDescription[] = [];
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
    return descriptors;
  }

  async execute(
    context: IntegrationContext,
    toolId: string,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const connector = this.findConnector(toolId);
    if (!connector) {
      throw new Error(`No connector registered for tool ${toolId}`);
    }
    const result = await connector.execute(toolId, args, context);
    return {
      toolId,
      result
    };
  }

  private findConnector(toolId: string) {
    for (const connector of this.connectors.values()) {
      if (connector.tools.some((tool) => tool.id === toolId)) {
        return connector;
      }
    }
    return undefined;
  }
}
