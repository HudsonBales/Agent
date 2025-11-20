import { redirect } from "next/navigation";
import { createSession, listAgents, listSessions } from "@/lib/api";

export default async function Home() {
  const sessions = await listSessions();
  if (sessions.length > 0) {
    redirect(`/chat/${sessions[0].id}`);
  }

  const agents = await listAgents();
  if (agents.length === 0) {
    throw new Error("No agents are configured for this workspace. Please add an agent to start chatting.");
  }

  const newSession = await createSession("", agents[0].id);
  redirect(`/chat/${newSession.id}`);
}
