import type { Agent, Message, Session, Tool } from "@/data/types";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? "ws-demo";

type ApiEnvelope<T> = { data: T };

type BackendMessage = {
  id: string;
  role: Message["role"];
  content: string;
  createdAt: string;
  blocks?: Message["blocks"];
  toolName?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

type BackendSession = {
  id: string;
  workspaceId: string;
  title: string;
  activeAgentId: string;
  updatedAt: string;
  createdAt: string;
  model: string;
  messages: BackendMessage[];
};

type BackendAgent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  toolsWhitelist: string[];
  triggers?: { type: string; details: Record<string, unknown> }[];
  workspaceId: string;
};

type BackendTool = {
  id: string;
  name: string;
  summary: string;
  namespace: string;
  capabilities: string[];
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status} for ${path}: ${text}`);
    }
    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.data;
  } catch (error) {
    console.error(`Fetch failed for ${API_BASE}${path}:`, error);
    throw new Error(`Failed to fetch from ${API_BASE}${path}. Please check if the backend server is running on port 4000.`);
  }
}

function mapMessage(message: BackendMessage): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    blocks: message.blocks,
    toolName: message.toolName,
    sessionId: message.sessionId ?? "",
    metadata: message.metadata
  };
}

function mapSession(session: BackendSession): Session {
  return {
    id: session.id,
    title: session.title,
    activeAgentId: session.activeAgentId,
    updatedAt: session.updatedAt,
    messages: session.messages?.map(mapMessage) ?? [],
    workspaceId: session.workspaceId,
    model: session.model,
    createdAt: session.createdAt
  };
}

function mapAgent(agent: BackendAgent): Agent {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    systemPrompt: agent.systemPrompt,
    tools: agent.toolsWhitelist,
    trigger: agent.triggers?.[0]?.details?.cron as string | undefined,
    toolsWhitelist: agent.toolsWhitelist,
    workspaceId: agent.workspaceId
  };
}

const toolCategoryMap: Record<string, Tool["category"]> = {
  stripe: "payments",
  supabase: "support",
  slack: "support",
  notion: "docs"
};

function mapTool(tool: BackendTool): Tool {
  const namespace = tool.namespace.toLowerCase();
  return {
    id: tool.id,
    name: tool.name,
    description: tool.summary,
    connected: true,
    category: toolCategoryMap[namespace] ?? "docs",
    namespace: tool.namespace,
    capabilities: tool.capabilities
  };
}

export async function listSessions(): Promise<Session[]> {
  const data = await apiFetch<BackendSession[]>(`/api/v1/workspaces/${WORKSPACE_ID}/sessions`);
  return data.map(mapSession).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSession(id: string): Promise<Session | undefined> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/sessions/${id}`, { cache: "no-store" });
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status} for session ${id}: ${text}`);
    }
    const payload = (await response.json()) as ApiEnvelope<BackendSession>;
    return mapSession(payload.data);
  } catch (error) {
    console.error(`Fetch failed for session ${id}:`, error);
    throw new Error(`Failed to fetch session ${id}. Please check if the backend server is running.`);
  }
}

export async function listAgents(): Promise<Agent[]> {
  const data = await apiFetch<BackendAgent[]>(`/api/v1/workspaces/${WORKSPACE_ID}/agents`);
  return data.map(mapAgent);
}

export async function listTools(): Promise<Tool[]> {
  const data = await apiFetch<BackendTool[]>(`/api/v1/workspaces/${WORKSPACE_ID}/tools`);
  return data.map(mapTool);
}

export async function createSession(message: string, agentId: string): Promise<Session> {
  const payload = await apiFetch<BackendSession>(`/api/v1/workspaces/${WORKSPACE_ID}/sessions`, {
    method: "POST",
    body: JSON.stringify({
      title: message.slice(0, 48) || "Untitled",
      agentId,
      message
    })
  });
  return mapSession(payload);
}

export async function listAnomalies(): Promise<any[]> {
  const data = await apiFetch<any[]>(`/api/v1/workspaces/${WORKSPACE_ID}/signals/anomalies`);
  return data;
}

export async function listWorkflows(): Promise<any[]> {
  const data = await apiFetch<any[]>(`/api/v1/workspaces/${WORKSPACE_ID}/workflows/runs`);
  return data;
}
