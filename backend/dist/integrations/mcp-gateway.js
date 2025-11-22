"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPGateway = void 0;
const notion_connector_1 = require("./connectors/notion-connector");
const slack_connector_1 = require("./connectors/slack-connector");
const stripe_connector_1 = require("./connectors/stripe-connector");
const supabase_connector_1 = require("./connectors/supabase-connector");
const github_connector_1 = require("./connectors/github-connector");
const mcp_client_1 = require("./mcp-client");
class MCPGateway {
    constructor(store) {
        this.store = store;
        this.connectors = new Map();
        this.mcpIntegrations = new Map();
        // Register built-in connectors
        [new stripe_connector_1.StripeConnector(), new supabase_connector_1.SupabaseConnector(), new slack_connector_1.SlackConnector(), new notion_connector_1.NotionConnector(), new github_connector_1.GitHubConnector()].forEach((connector) => this.registerConnector(connector));
        // Register MCP integrations
        this.registerMCPIntegration("stripe", "Stripe", "npx", ["-y", "@modelcontextprotocol/server-stripe"]);
        this.registerMCPIntegration("supabase", "Supabase", "npx", ["-y", "@modelcontextprotocol/server-supabase"]);
    }
    registerConnector(connector) {
        this.connectors.set(connector.id, connector);
    }
    async registerMCPIntegration(id, name, command, args) {
        const client = new mcp_client_1.MCPClient(command, args);
        try {
            await client.connect();
            this.mcpIntegrations.set(id, { id, name, client });
            console.log(`MCP integration ${name} connected successfully`);
        }
        catch (error) {
            console.error(`Failed to connect MCP integration ${name}:`, error);
        }
    }
    async listTools() {
        const descriptors = [];
        // Add tools from built-in connectors
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
        // Add tools from MCP integrations
        for (const integration of this.mcpIntegrations.values()) {
            try {
                const tools = await integration.client.listTools();
                descriptors.push(...tools);
            }
            catch (error) {
                console.error(`Failed to list tools for ${integration.name}:`, error);
            }
        }
        return descriptors;
    }
    async execute(context, toolId, args) {
        // Try built-in connectors first
        const connector = this.findConnector(toolId);
        if (connector) {
            const enrichedContext = this.enrichContext(context, connector);
            const result = await connector.execute(toolId, args, enrichedContext);
            return {
                toolId,
                result
            };
        }
        // Try MCP integrations
        const mcpResult = await this.executeMCPTool(toolId, args);
        if (mcpResult) {
            return mcpResult;
        }
        throw new Error(`No connector or MCP integration registered for tool ${toolId}`);
    }
    findConnector(toolId) {
        for (const connector of this.connectors.values()) {
            if (connector.tools.some((tool) => tool.id === toolId)) {
                return connector;
            }
        }
        return undefined;
    }
    enrichContext(context, connector) {
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
    async executeMCPTool(toolId, args) {
        for (const integration of this.mcpIntegrations.values()) {
            try {
                // Check if this integration has the tool
                const tools = await integration.client.listTools();
                if (tools.some(tool => tool.id === toolId)) {
                    const result = await integration.client.callTool(toolId, args);
                    return {
                        toolId,
                        result
                    };
                }
            }
            catch (error) {
                console.error(`Failed to execute tool ${toolId} on ${integration.name}:`, error);
            }
        }
        return null;
    }
}
exports.MCPGateway = MCPGateway;
//# sourceMappingURL=mcp-gateway.js.map