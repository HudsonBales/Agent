import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import {
  Agent,
  Anomaly,
  Insight,
  Message,
  MetricSeries,
  Session,
  UISchema,
  WorkflowDefinition,
  WorkflowRun,
  Workspace
} from "../types";

interface SeedData {
  workspaces: Workspace[];
  agents: Agent[];
  sessions: Session[];
  workflows: WorkflowDefinition[];
  metrics: MetricSeries[];
  anomalies: Anomaly[];
  uiSchemas: UISchema[];
  insights: Insight[];
}

interface PersistedState extends SeedData {
  workflowRuns: WorkflowRun[];
}

interface DataStoreOptions {
  persistPath?: string;
}

export class DataStore {
  private workspaces: Workspace[];
  private agents: Agent[];
  private sessions: Session[];
  private workflows: WorkflowDefinition[];
  private workflowRuns: WorkflowRun[] = [];
  private metrics: MetricSeries[];
  private anomalies: Anomaly[];
  private uiSchemas: UISchema[];
  private insights: Insight[];
  private persistPath: string | undefined;

  constructor(seed: SeedData, options?: DataStoreOptions) {
    this.persistPath = options?.persistPath;
    if (this.persistPath && fs.existsSync(this.persistPath)) {
      const persisted = JSON.parse(fs.readFileSync(this.persistPath, "utf-8")) as PersistedState;
      this.workspaces = persisted.workspaces ?? seed.workspaces;
      this.agents = persisted.agents ?? seed.agents;
      this.sessions = persisted.sessions ?? seed.sessions;
      this.workflows = persisted.workflows ?? seed.workflows;
      this.metrics = persisted.metrics ?? seed.metrics;
      this.anomalies = persisted.anomalies ?? seed.anomalies;
      this.uiSchemas = persisted.uiSchemas ?? seed.uiSchemas;
      this.insights = persisted.insights ?? seed.insights;
      this.workflowRuns = persisted.workflowRuns ?? [];
    } else {
      this.workspaces = seed.workspaces;
      this.agents = seed.agents;
      this.sessions = seed.sessions;
      this.workflows = seed.workflows;
      this.metrics = seed.metrics;
      this.anomalies = seed.anomalies;
      this.uiSchemas = seed.uiSchemas;
      this.insights = seed.insights;
      this.workflowRuns = [];
      this.persist();
    }
  }

  getWorkspace(workspaceId: string) {
    return this.workspaces.find((workspace) => workspace.id === workspaceId);
  }

  listAgents(workspaceId: string) {
    return this.agents.filter((agent) => agent.workspaceId === workspaceId);
  }

  getAgent(agentId: string) {
    return this.agents.find((agent) => agent.id === agentId);
  }

  saveAgent(agent: Agent) {
    const existingIndex = this.agents.findIndex((a) => a.id === agent.id);
    if (existingIndex !== -1) {
      this.agents[existingIndex] = agent;
    } else {
      this.agents.push(agent);
    }
    this.persist();
    return agent;
  }

  listSessions(workspaceId: string) {
    return this.sessions.filter((session) => session.workspaceId === workspaceId);
  }

  getSession(sessionId: string) {
    return this.sessions.find((session) => session.id === sessionId);
  }

  createSession(workspaceId: string, payload: { title: string; activeAgentId: string; message: string }) {
    const now = new Date().toISOString();
    const session: Session = {
      id: `sess-${nanoid(8)}`,
      workspaceId,
      title: payload.title,
      activeAgentId: payload.activeAgentId,
      model: "gpt-4o-mini",
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${nanoid(8)}`,
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

  appendMessage(sessionId: string, message: Omit<Message, "id">) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    const newMessage: Message = { ...message, id: `msg-${nanoid(8)}`, sessionId };
    session.messages.push(newMessage);
    session.updatedAt = new Date().toISOString();
    this.persist();
    return newMessage;
  }

  getWorkflows(workspaceId: string) {
    return this.workflows.filter((workflow) => workflow.workspaceId === workspaceId);
  }

  getWorkflow(definitionId: string) {
    return this.workflows.find((workflow) => workflow.id === definitionId);
  }

  saveWorkflow(definition: WorkflowDefinition) {
    const idx = this.workflows.findIndex((workflow) => workflow.id === definition.id);
    if (idx >= 0) {
      this.workflows[idx] = definition;
    } else {
      this.workflows.push(definition);
    }
    this.persist();
    return definition;
  }

  recordWorkflowRun(run: WorkflowRun) {
    this.workflowRuns.push(run);
     this.persist();
    return run;
  }

  replaceWorkflowRun(run: WorkflowRun) {
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

  listWorkflowRuns(workspaceId: string) {
    const workflowIds = new Set(this.getWorkflows(workspaceId).map((workflow) => workflow.id));
    return this.workflowRuns.filter((run) => workflowIds.has(run.definitionId));
  }

  listMetrics(workspaceId: string) {
    return this.metrics.filter((metric) => metric.workspaceId === workspaceId);
  }

  saveMetric(series: MetricSeries) {
    const idx = this.metrics.findIndex((metric) => metric.id === series.id);
    if (idx >= 0) {
      this.metrics[idx] = series;
    } else {
      this.metrics.push(series);
    }
    this.persist();
    return series;
  }

  listAnomalies(workspaceId: string) {
    return this.anomalies.filter((anomaly) => anomaly.workspaceId === workspaceId);
  }

  saveAnomaly(anomaly: Anomaly) {
    const idx = this.anomalies.findIndex((item) => item.id === anomaly.id);
    if (idx >= 0) {
      this.anomalies[idx] = anomaly;
    } else {
      this.anomalies.push(anomaly);
    }
    this.persist();
    return anomaly;
  }

  listUISchemas(workspaceId: string, context?: string) {
    return this.uiSchemas.filter(
      (schema) => schema.workspaceId === workspaceId && (!context || schema.context === context)
    );
  }

  saveUISchema(schema: UISchema) {
    const idx = this.uiSchemas.findIndex((item) => item.id === schema.id);
    if (idx >= 0) {
      this.uiSchemas[idx] = schema;
    } else {
      this.uiSchemas.push(schema);
    }
    this.persist();
    return schema;
  }

  listInsights(workspaceId: string) {
    return this.insights.filter((insight) => insight.workspaceId === workspaceId);
  }

  saveInsight(insight: Insight) {
    const idx = this.insights.findIndex((item) => item.id === insight.id);
    if (idx >= 0) {
      this.insights[idx] = insight;
    } else {
      this.insights.push(insight);
    }
    this.persist();
    return insight;
  }

  private persist() {
    if (!this.persistPath) {
      return;
    }
    const snapshot: PersistedState = {
      workspaces: this.workspaces,
      agents: this.agents,
      sessions: this.sessions,
      workflows: this.workflows,
      metrics: this.metrics,
      anomalies: this.anomalies,
      uiSchemas: this.uiSchemas,
      insights: this.insights,
      workflowRuns: this.workflowRuns
    };
    const dir = path.dirname(this.persistPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.persistPath, JSON.stringify(snapshot, null, 2));
  }
}
