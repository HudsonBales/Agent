export type Role = "system" | "user" | "assistant" | "tool";

type MetricsBlock = {
  type: "metrics";
  metrics: { label: string; value: string; delta?: string }[];
  title?: string;
};

type TableBlock = {
  type: "table";
  columns: string[];
  rows: string[][];
  title?: string;
};

type ErrorBlock = {
  type: "error";
  title: string;
  body: string;
};

type PlanBlock = {
  type: "plan";
  title?: string;
  data?: unknown;
};

type UISchemaBlock = {
  type: "ui_schema";
  title?: string;
  data?: unknown;
};

type GenericBlock = {
  type: string;
  title?: string;
  data?: unknown;
  [key: string]: unknown;
};

export type MessageBlock = MetricsBlock | TableBlock | ErrorBlock | PlanBlock | UISchemaBlock | GenericBlock;

export interface Message {
  id: string;
  sessionId?: string;
  role: Role;
  content: string;
  createdAt: string;
  blocks?: MessageBlock[];
  metadata?: Record<string, unknown>;
  toolName?: string;
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
  mcpData?: MCPData;
}

export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  trigger?: string;
  toolsWhitelist?: string[];
}

export type ToolCategory = "payments" | "email" | "docs" | "support";

export interface Tool {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  category: ToolCategory;
  namespace?: string;
  capabilities?: string[];
}

export type MCPMetric = {
  label: string;
  value: string;
  delta?: string;
};

export type MCPWorkflow = {
  id: string;
  title: string;
  condition: string;
  channel: string;
  status: "Live" | "Draft";
};

export type MCPEvent = {
  id: string;
  label: string;
  time: string;
};

export type MCPDataSource = {
  name: string;
  description: string;
  status: string;
};

export type MCPData = {
  metrics?: MCPMetric[];
  churnRows?: string[][];
  anomalies?: { title: string; body: string }[];
  workflows?: MCPWorkflow[];
  eventStream?: MCPEvent[];
  dataSources?: MCPDataSource[];
};