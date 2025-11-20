import { Agent, Anomaly, Insight, Message, MetricSeries, Session, UISchema, WorkflowDefinition, WorkflowRun, Workspace } from "../types";
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
interface DataStoreOptions {
    persistPath?: string;
}
export declare class DataStore {
    private workspaces;
    private agents;
    private sessions;
    private workflows;
    private workflowRuns;
    private metrics;
    private anomalies;
    private uiSchemas;
    private insights;
    private persistPath;
    constructor(seed: SeedData, options?: DataStoreOptions);
    getWorkspace(workspaceId: string): Workspace | undefined;
    listAgents(workspaceId: string): Agent[];
    getAgent(agentId: string): Agent | undefined;
    saveAgent(agent: Agent): Agent;
    listSessions(workspaceId: string): Session[];
    getSession(sessionId: string): Session | undefined;
    createSession(workspaceId: string, payload: {
        title: string;
        activeAgentId: string;
        message: string;
    }): Session;
    appendMessage(sessionId: string, message: Omit<Message, "id">): Message;
    getWorkflows(workspaceId: string): WorkflowDefinition[];
    getWorkflow(definitionId: string): WorkflowDefinition | undefined;
    saveWorkflow(definition: WorkflowDefinition): WorkflowDefinition;
    recordWorkflowRun(run: WorkflowRun): WorkflowRun;
    replaceWorkflowRun(run: WorkflowRun): WorkflowRun;
    listWorkflowRuns(workspaceId: string): WorkflowRun[];
    listMetrics(workspaceId: string): MetricSeries[];
    saveMetric(series: MetricSeries): MetricSeries;
    listAnomalies(workspaceId: string): Anomaly[];
    saveAnomaly(anomaly: Anomaly): Anomaly;
    listUISchemas(workspaceId: string, context?: string): UISchema[];
    saveUISchema(schema: UISchema): UISchema;
    listInsights(workspaceId: string): Insight[];
    saveInsight(insight: Insight): Insight;
    private persist;
}
export {};
//# sourceMappingURL=store.d.ts.map