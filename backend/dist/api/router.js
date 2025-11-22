"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const integration_router_1 = require("./integration-router");
function createApp(deps) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Create integration router
    const integrationRouter = (0, integration_router_1.createIntegrationRouter)({
        store: deps.store,
        gateway: deps.gateway
    });
    // Mount integration router
    app.use("/api/v1/integrations", integrationRouter);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", now: new Date().toISOString() });
    });
    app.get("/api/v1/workspaces/:workspaceId/sessions", (req, res) => {
        const sessions = deps.store.listSessions(req.params.workspaceId);
        res.json({ data: sessions });
    });
    app.post("/api/v1/workspaces/:workspaceId/sessions", (req, res) => {
        const { title, agentId, message } = req.body;
        const session = deps.store.createSession(req.params.workspaceId, {
            title: title ?? "Untitled",
            activeAgentId: agentId,
            message: message ?? ""
        });
        res.status(201).json({ data: session });
    });
    app.get("/api/v1/sessions/:sessionId", (req, res) => {
        const session = deps.store.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ data: session });
    });
    app.get("/api/v1/sessions/:sessionId/messages", (req, res) => {
        const session = deps.store.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ data: session.messages });
    });
    app.post("/api/v1/chat/:sessionId/stream", async (req, res) => {
        const { workspaceId, message, actorId } = req.body;
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();
        // If no message provided, just establish connection for real-time events
        if (!message || message.trim() === "") {
            // Keep connection alive and listen for real-time events
            const sendEvent = (type, data) => {
                res.write(`event: ${type}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            // Listen for real-time events
            const cleanupListeners = [];
            const anomalyListener = (payload) => {
                sendEvent("anomaly", payload);
            };
            const workflowListener = (payload) => {
                sendEvent("workflow", payload);
            };
            const uiListener = (payload) => {
                sendEvent("ui_update", payload);
            };
            deps.bus.on("signals.anomaly.detected", anomalyListener);
            deps.bus.on("workflow.run.completed", workflowListener);
            deps.bus.on("ui.schema.generated", uiListener);
            // Keep connection alive
            const keepAlive = setInterval(() => {
                res.write(`:\n\n`); // SSE comment to keep connection alive
            }, 30000);
            // Clean up on connection close
            req.on("close", () => {
                clearInterval(keepAlive);
                // Note: EventEmitter.removeListener is not directly available in our implementation
                // The listeners will be garbage collected when the connection closes
            });
            return;
        }
        const stream = deps.orchestrator.runChat({
            workspaceId,
            sessionId: req.params.sessionId,
            message,
            actorId: actorId ?? "user"
        });
        try {
            for await (const event of stream) {
                res.write(`event: ${event.type}\n`);
                res.write(`data: ${JSON.stringify(event.data)}\n\n`);
            }
            res.end();
        }
        catch (error) {
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
            res.end();
        }
    });
    app.get("/api/v1/workspaces/:workspaceId/agents", (req, res) => {
        res.json({ data: deps.store.listAgents(req.params.workspaceId) });
    });
    app.post("/api/v1/workspaces/:workspaceId/agents", (req, res) => {
        const payload = req.body;
        const now = new Date().toISOString();
        const agent = {
            id: payload.id ?? `agent-${Date.now()}`,
            workspaceId: req.params.workspaceId,
            name: payload.name,
            description: payload.description,
            systemPrompt: payload.systemPrompt,
            toolsWhitelist: payload.toolsWhitelist ?? [],
            defaultInputRole: payload.defaultInputRole ?? "user",
            triggers: payload.triggers ?? [],
            createdAt: now,
            updatedAt: now
        };
        deps.store.saveAgent(agent);
        res.status(201).json({ data: agent });
    });
    app.get("/api/v1/workspaces/:workspaceId/tools", async (_req, res) => {
        const tools = await deps.gateway.listTools();
        res.json({ data: tools });
    });
    app.get("/api/v1/workspaces/:workspaceId/signals/metrics", (req, res) => {
        res.json({ data: deps.signals.getMetrics(req.params.workspaceId) });
    });
    app.get("/api/v1/workspaces/:workspaceId/signals/anomalies", (req, res) => {
        res.json({ data: deps.signals.getAnomalies(req.params.workspaceId) });
    });
    app.get("/api/v1/workspaces/:workspaceId/ui/:context", (req, res) => {
        const schema = deps.ui.getLatestSchema(req.params.workspaceId, req.params.context);
        if (!schema) {
            return res.status(404).json({ error: "Schema not found" });
        }
        res.json({ data: schema });
    });
    app.post("/api/v1/workspaces/:workspaceId/ui/:context/regenerate", (req, res) => {
        const schema = deps.ui.regenerate(req.params.workspaceId, req.params.context);
        res.json({ data: schema });
    });
    app.get("/api/v1/workspaces/:workspaceId/workflows", (req, res) => {
        res.json({ data: deps.workflows.listDefinitions(req.params.workspaceId) });
    });
    app.get("/api/v1/workspaces/:workspaceId/workflows/runs", (req, res) => {
        res.json({ data: deps.workflows.listRuns(req.params.workspaceId) });
    });
    app.post("/api/v1/workflows/:workflowId/run", async (req, res) => {
        try {
            const run = await deps.workflows.runWorkflow(req.params.workflowId, {
                workspaceId: req.body.workspaceId ?? "ws-demo",
                actorId: req.body.actorId ?? "api",
                reason: req.body.reason ?? "manual"
            });
            res.json({ data: run });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    app.get("/api/v1/workspaces/:workspaceId/overview", (req, res) => {
        const workspaceId = req.params.workspaceId;
        res.json({
            data: {
                sessions: deps.store.listSessions(workspaceId),
                agents: deps.store.listAgents(workspaceId),
                metrics: deps.signals.getMetrics(workspaceId),
                anomalies: deps.signals.getAnomalies(workspaceId),
                uiSchema: deps.ui.getLatestSchema(workspaceId, "main_dashboard")
            }
        });
    });
    return app;
}
//# sourceMappingURL=router.js.map