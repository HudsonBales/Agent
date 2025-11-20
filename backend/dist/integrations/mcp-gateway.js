"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPGateway = void 0;
const notion_connector_1 = require("./connectors/notion-connector");
const slack_connector_1 = require("./connectors/slack-connector");
const stripe_connector_1 = require("./connectors/stripe-connector");
const supabase_connector_1 = require("./connectors/supabase-connector");
class MCPGateway {
    constructor() {
        this.connectors = new Map();
        [new stripe_connector_1.StripeConnector(), new supabase_connector_1.SupabaseConnector(), new slack_connector_1.SlackConnector(), new notion_connector_1.NotionConnector()].forEach((connector) => this.registerConnector(connector));
    }
    registerConnector(connector) {
        this.connectors.set(connector.id, connector);
    }
    listTools() {
        const descriptors = [];
        for (const connector of this.connectors.values()) {
            connector.tools.forEach((tool) => descriptors.push({
                id: tool.id,
                name: `${connector.name} · ${tool.name}`,
                summary: tool.description,
                namespace: connector.namespace,
                example: JSON.stringify(tool.args),
                version: "1.0",
                capabilities: ["read", "write"]
            }));
        }
        return descriptors;
    }
    async execute(context, toolId, args) {
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
    findConnector(toolId) {
        for (const connector of this.connectors.values()) {
            if (connector.tools.some((tool) => tool.id === toolId)) {
                return connector;
            }
        }
        return undefined;
    }
}
exports.MCPGateway = MCPGateway;
//# sourceMappingURL=mcp-gateway.js.map