import { agents, sessions, tools, type Session, type Agent, type Tool } from "@/data/mock";

const latency = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listSessions(): Promise<Session[]> {
  await latency();
  return sessions.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSession(id: string): Promise<Session | undefined> {
  await latency();
  return sessions.find((session) => session.id === id);
}

export async function listAgents(): Promise<Agent[]> {
  await latency();
  return agents;
}

export async function listTools(): Promise<Tool[]> {
  await latency();
  return tools;
}

export async function createSession(message: string, agentId: string) {
  await latency();
  const now = new Date().toISOString();
  const session: Session = {
    id: `sess-${Math.random().toString(36).slice(2, 8)}`,
    title: message.slice(0, 48) || "Untitled",
    activeAgentId: agentId,
    updatedAt: now,
    messages: [
      {
        id: `msg-${Math.random().toString(36).slice(2, 8)}`,
        role: "user",
        content: message,
        createdAt: now
      }
    ]
  };
  sessions.unshift(session);
  return session;
}
