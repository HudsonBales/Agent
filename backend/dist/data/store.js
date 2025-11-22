"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStore = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const nanoid_1 = require("nanoid");
class DataStore {
    constructor(seed, options) {
        this.workflowRuns = [];
        this.integrationConnections = [];
        this.integrationTokens = [];
        this.persistPath = options?.persistPath;
        if (this.persistPath && node_fs_1.default.existsSync(this.persistPath)) {
            const persisted = JSON.parse(node_fs_1.default.readFileSync(this.persistPath, "utf-8"));
            this.workspaces = persisted.workspaces ?? seed.workspaces;
            this.agents = persisted.agents ?? seed.agents;
            this.sessions = persisted.sessions ?? seed.sessions;
            this.workflows = persisted.workflows ?? seed.workflows;
            this.metrics = persisted.metrics ?? seed.metrics;
            this.anomalies = persisted.anomalies ?? seed.anomalies;
            this.uiSchemas = persisted.uiSchemas ?? seed.uiSchemas;
            this.insights = persisted.insights ?? seed.insights;
            this.workflowRuns = persisted.workflowRuns ?? [];
            this.integrationConnections = persisted.integrationConnections ?? [];
            this.integrationTokens = persisted.integrationTokens ?? [];
        }
        else {
            this.workspaces = seed.workspaces;
            this.agents = seed.agents;
            this.sessions = seed.sessions;
            this.workflows = seed.workflows;
            this.metrics = seed.metrics;
            this.anomalies = seed.anomalies;
            this.uiSchemas = seed.uiSchemas;
            this.insights = seed.insights;
            this.workflowRuns = [];
            this.integrationConnections = [];
            this.integrationTokens = [];
            this.persist();
        }
    }
    getWorkspace(workspaceId) {
        return this.workspaces.find((workspace) => workspace.id === workspaceId);
    }
    listAgents(workspaceId) {
        return this.agents.filter((agent) => agent.workspaceId === workspaceId);
    }
    getAgent(agentId) {
        return this.agents.find((agent) => agent.id === agentId);
    }
    saveAgent(agent) {
        const existingIndex = this.agents.findIndex((a) => a.id === agent.id);
        if (existingIndex !== -1) {
            this.agents[existingIndex] = agent;
        }
        else {
            this.agents.push(agent);
        }
        this.persist();
        return agent;
    }
    listSessions(workspaceId) {
        return this.sessions.filter((session) => session.workspaceId === workspaceId);
    }
    getSession(sessionId) {
        return this.sessions.find((session) => session.id === sessionId);
    }
    createSession(workspaceId, payload) {
        const now = new Date().toISOString();
        const session = {
            id: `sess-${(0, nanoid_1.nanoid)(8)}`,
            workspaceId,
            title: payload.title,
            activeAgentId: payload.activeAgentId,
            model: "gpt-4o-mini",
            createdAt: now,
            updatedAt: now,
            messages: [
                {
                    id: `msg-${(0, nanoid_1.nanoid)(8)}`,
                    sessionId: "",
                    role: "user",
                    content: payload.message,
                    createdAt: now
                }
            ]
        };
        if (session.messages[0]) {
            session.messages[0].sessionId = session.id;
        }
        this.sessions.unshift(session);
        this.persist();
        return session;
    }
    appendMessage(sessionId, message) {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        const newMessage = { ...message, id: `msg-${(0, nanoid_1.nanoid)(8)}`, sessionId };
        session.messages.push(newMessage);
        session.updatedAt = new Date().toISOString();
        this.persist();
        return newMessage;
    }
    getWorkflows(workspaceId) {
        return this.workflows.filter((workflow) => workflow.workspaceId === workspaceId);
    }
    getWorkflow(definitionId) {
        return this.workflows.find((workflow) => workflow.id === definitionId);
    }
    saveWorkflow(definition) {
        const idx = this.workflows.findIndex((workflow) => workflow.id === definition.id);
        if (idx >= 0) {
            this.workflows[idx] = definition;
        }
        else {
            this.workflows.push(definition);
        }
        this.persist();
        return definition;
    }
    recordWorkflowRun(run) {
        this.workflowRuns.push(run);
        this.persist();
        return run;
    }
    replaceWorkflowRun(run) {
        const idx = this.workflowRuns.findIndex((item) => item.id === run.id);
        if (idx >= 0) {
            this.workflowRuns[idx] = run;
            this.persist();
            return run;
        }
        this.workflowRuns.push(run);
        this.persist();
        return run;
    }
    listWorkflowRuns(workspaceId) {
        const workflowIds = new Set(this.getWorkflows(workspaceId).map((workflow) => workflow.id));
        return this.workflowRuns.filter((run) => workflowIds.has(run.definitionId));
    }
    listMetrics(workspaceId) {
        return this.metrics.filter((metric) => metric.workspaceId === workspaceId);
    }
    saveMetric(series) {
        const idx = this.metrics.findIndex((metric) => metric.id === series.id);
        if (idx >= 0) {
            this.metrics[idx] = series;
        }
        else {
            this.metrics.push(series);
        }
        this.persist();
        return series;
    }
    listAnomalies(workspaceId) {
        return this.anomalies.filter((anomaly) => anomaly.workspaceId === workspaceId);
    }
    saveAnomaly(anomaly) {
        const idx = this.anomalies.findIndex((item) => item.id === anomaly.id);
        if (idx >= 0) {
            this.anomalies[idx] = anomaly;
        }
        else {
            this.anomalies.push(anomaly);
        }
        this.persist();
        return anomaly;
    }
    listUISchemas(workspaceId, context) {
        return this.uiSchemas.filter((schema) => schema.workspaceId === workspaceId && (!context || schema.context === context));
    }
    saveUISchema(schema) {
        const idx = this.uiSchemas.findIndex((item) => item.id === schema.id);
        if (idx >= 0) {
            this.uiSchemas[idx] = schema;
        }
        else {
            this.uiSchemas.push(schema);
        }
        this.persist();
        return schema;
    }
    listInsights(workspaceId) {
        return this.insights.filter((insight) => insight.workspaceId === workspaceId);
    }
    saveInsight(insight) {
        const idx = this.insights.findIndex((item) => item.id === insight.id);
        if (idx >= 0) {
            this.insights[idx] = insight;
        }
        else {
            this.insights.push(insight);
        }
        this.persist();
        return insight;
    }
    listIntegrationConnections(workspaceId) {
        return this.integrationConnections.filter((connection) => connection.workspaceId === workspaceId);
    }
    getIntegrationConnection(workspaceId, integrationId) {
        return this.integrationConnections.find((connection) => connection.workspaceId === workspaceId && connection.integrationId === integrationId);
    }
    upsertIntegrationConnection(workspaceId, integrationId, payload) {
        const now = new Date().toISOString();
        const existing = this.getIntegrationConnection(workspaceId, integrationId);
        let connection;
        if (existing) {
            connection = {
                ...existing,
                accessToken: payload.accessToken ?? existing.accessToken,
                connected: payload.connected ?? true,
                updatedAt: now
            };
            if (payload.refreshToken !== undefined) {
                connection.refreshToken = payload.refreshToken;
            }
            if (payload.expiresAt !== undefined) {
                connection.expiresAt = payload.expiresAt;
            }
            if (payload.connectionMetadata !== undefined) {
                connection.connectionMetadata = payload.connectionMetadata;
            }
            const idx = this.integrationConnections.findIndex((item) => item.id === connection.id);
            if (idx >= 0) {
                this.integrationConnections[idx] = connection;
            }
        }
        else {
            connection = {
                id: `conn-${(0, nanoid_1.nanoid)(8)}`,
                workspaceId,
                integrationId,
                accessToken: payload.accessToken ?? "",
                connected: payload.connected ?? true,
                connectionMetadata: payload.connectionMetadata ?? {},
                createdAt: now,
                updatedAt: now
            };
            if (payload.refreshToken !== undefined) {
                connection.refreshToken = payload.refreshToken;
            }
            if (payload.expiresAt !== undefined) {
                connection.expiresAt = payload.expiresAt;
            }
            this.integrationConnections.push(connection);
        }
        this.persist();
        return connection;
    }
    disconnectIntegration(workspaceId, integrationId) {
        const connection = this.getIntegrationConnection(workspaceId, integrationId);
        if (!connection) {
            return null;
        }
        connection.connected = false;
        connection.updatedAt = new Date().toISOString();
        this.persist();
        return connection;
    }
    persist() {
        if (!this.persistPath) {
            return;
        }
        const snapshot = {
            workspaces: this.workspaces,
            agents: this.agents,
            sessions: this.sessions,
            workflows: this.workflows,
            metrics: this.metrics,
            anomalies: this.anomalies,
            uiSchemas: this.uiSchemas,
            insights: this.insights,
            workflowRuns: this.workflowRuns,
            integrationConnections: this.integrationConnections,
            integrationTokens: this.integrationTokens
        };
        const dir = node_path_1.default.dirname(this.persistPath);
        if (!node_fs_1.default.existsSync(dir)) {
            node_fs_1.default.mkdirSync(dir, { recursive: true });
        }
        node_fs_1.default.writeFileSync(this.persistPath, JSON.stringify(snapshot, null, 2));
    }
}
exports.DataStore = DataStore;
//# sourceMappingURL=store.js.map