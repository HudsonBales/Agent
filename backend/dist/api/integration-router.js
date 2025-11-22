"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntegrationRouter = createIntegrationRouter;
const express_1 = __importDefault(require("express"));
function createIntegrationRouter(deps) {
    const router = express_1.default.Router();
    // Get integration catalog
    router.get("/catalog", async (req, res) => {
        const workspaceId = req.query.workspaceId ?? "ws-demo";
        const connections = deps.store.listIntegrationConnections(workspaceId);
        const tools = await deps.gateway.listTools();
        // Group tools by integration
        const integrations = {};
        tools.forEach(tool => {
            const namespace = tool.namespace;
            if (!integrations[namespace]) {
                integrations[namespace] = {
                    id: namespace,
                    name: getIntegrationName(namespace),
                    description: getIntegrationDescription(namespace),
                    category: getIntegrationCategory(namespace),
                    logo: getIntegrationLogo(namespace),
                    connected: isIntegrationConnected(namespace, connections),
                    lastConnectedAt: getLastConnectedAt(namespace, connections),
                    tools: []
                };
            }
            integrations[namespace].tools.push(tool);
        });
        res.json({
            data: Object.values(integrations)
        });
    });
    // Connect an integration
    router.post("/:integrationId/connect", (req, res) => {
        const { integrationId } = req.params;
        const { credentials, workspaceId = "ws-demo" } = req.body;
        if (!credentials) {
            return res.status(400).json({ error: "Credentials are required to connect an integration" });
        }
        const connection = deps.store.upsertIntegrationConnection(workspaceId, integrationId, {
            accessToken: credentials.accessToken ?? credentials.apiKey ?? "",
            refreshToken: credentials.refreshToken,
            expiresAt: credentials.expiresAt,
            connectionMetadata: {
                ...credentials.metadata,
                workspaceId
            }
        });
        res.json({
            data: {
                success: true,
                message: `${getIntegrationName(integrationId)} connected successfully`,
                connection
            }
        });
    });
    // Disconnect an integration
    router.post("/:integrationId/disconnect", (req, res) => {
        const { integrationId } = req.params;
        const { workspaceId = "ws-demo" } = req.body;
        deps.store.disconnectIntegration(workspaceId, integrationId);
        res.json({
            data: {
                success: true,
                message: `${getIntegrationName(integrationId)} disconnected successfully`
            }
        });
    });
    // Get connection status
    router.get("/:integrationId/status", (req, res) => {
        const { integrationId } = req.params;
        const workspaceId = req.query.workspaceId ?? "ws-demo";
        const connection = deps.store.getIntegrationConnection(workspaceId, integrationId);
        const connected = Boolean(connection?.connected);
        res.json({
            data: {
                connected,
                integration: integrationId,
                lastConnectedAt: connection?.updatedAt
            }
        });
    });
    return router;
}
function getIntegrationName(namespace) {
    const names = {
        stripe: "Stripe",
        supabase: "Supabase",
        slack: "Slack",
        notion: "Notion",
        github: "GitHub"
    };
    return names[namespace] || namespace;
}
function getIntegrationDescription(namespace) {
    const descriptions = {
        stripe: "Payment processing and subscription management",
        supabase: "Database, authentication, and real-time subscriptions",
        slack: "Team communication and notifications",
        notion: "Documentation and knowledge management",
        github: "Code repository and issue management"
    };
    return descriptions[namespace] || `Integration for ${namespace}`;
}
function getIntegrationCategory(namespace) {
    const categories = {
        stripe: "payments",
        supabase: "database",
        slack: "communication",
        notion: "documentation",
        github: "development"
    };
    return categories[namespace] || "other";
}
function getIntegrationLogo(namespace) {
    // In a real implementation, this would return a URL to the integration's logo
    return `/logos/${namespace}.svg`;
}
function isIntegrationConnected(namespace, connections) {
    return connections.some((connection) => connection.integrationId === namespace && connection.connected);
}
function getLastConnectedAt(namespace, connections) {
    const connection = connections.find((conn) => conn.integrationId === namespace && conn.connected);
    return connection?.updatedAt;
}
//# sourceMappingURL=integration-router.js.map