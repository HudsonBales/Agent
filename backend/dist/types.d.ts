export type Role = "system" | "user" | "assistant" | "tool";
export interface Workspace {
    id: string;
    name: string;
    timezone: string;
    defaultAgentId: string;
    createdAt: string;
}
export interface MessageBlock {
    type: string;
    title?: string;
    data: unknown;
}
export interface Message {
    id: string;
    sessionId: string;
    role: Role;
    content: string;
    createdAt: string;
    blocks?: MessageBlock[];
    metadata?: Record<string, unknown>;
}
export interface Session {
    id: string;
    workspaceId: string;
    title: string;
    activeAgentId: string;
    model: string;
    updatedAt: string;
    createdAt: string;
    messages: Message[];
}
export interface Agent {
    id: string;
    workspaceId: string;
    name: string;
    description: string;
    systemPrompt: string;
    toolsWhitelist: string[];
    defaultInputRole: Role;
    triggers: AgentTrigger[];
    createdAt: string;
    updatedAt: string;
}
export interface AgentTrigger {
    type: "manual" | "schedule" | "event";
    details: Record<string, unknown>;
}
export interface ToolDescription {
    id: string;
    name: string;
    summary: string;
    namespace: string;
    example: string;
    version: string;
    capabilities: string[];
}
export interface IntegrationContext {
    workspaceId: string;
    actorId: string;
}
export interface WorkflowStep {
    id: string;
    type: "tool" | "compute" | "branch" | "wait" | "notify";
    name: string;
    toolId?: string;
    input?: Record<string, unknown>;
    expression?: string;
    condition?: string;
    nextStepId?: string;
}
export interface WorkflowDefinition {
    id: string;
    workspaceId: string;
    name: string;
    description: string;
    trigger: {
        type: "manual" | "schedule" | "event";
        details: Record<string, unknown>;
    };
    steps: WorkflowStep[];
    createdAt: string;
    updatedAt: string;
}
export type WorkflowStatus = "pending" | "running" | "succeeded" | "failed";
export interface WorkflowRun {
    id: string;
    definitionId: string;
    status: WorkflowStatus;
    startedAt: string;
    completedAt?: string;
    logs: string[];
    output?: Record<string, unknown>;
}
export interface MetricPoint {
    timestamp: string;
    value: number;
}
export interface MetricSeries {
    id: string;
    workspaceId: string;
    name: string;
    unit: string;
    points: MetricPoint[];
}
export interface Anomaly {
    id: string;
    workspaceId: string;
    metricId: string;
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    detectedAt: string;
    baseline: number;
    observed: number;
}
export interface UISchema {
    id: string;
    workspaceId: string;
    context: string;
    version: number;
    layout: Record<string, unknown>;
    createdAt: string;
}
export interface Insight {
    id: string;
    workspaceId: string;
    text: string;
    category: "metric" | "incident" | "suggestion";
    createdAt: string;
}
export interface EdgeResponse<T> {
    data: T;
}
export interface ChatStreamEvent {
    type: "token" | "tool_call" | "plan" | "insight" | "ui_schema" | "final" | "error";
    data: unknown;
}
//# sourceMappingURL=types.d.ts.map