"use client";

import { ReactNode } from "react";
import { Agent, Session } from "@/data/mock";
import { Sidebar } from "./sidebar";
import { createSession } from "@/lib/api";

interface Props {
  children: ReactNode;
  sessions: Session[];
  agents: Agent[];
}

export function AppShell({ children, sessions, agents }: Props) {
  async function handleNewChat(agentId: string) {
    const session = await createSession("New conversation", agentId);
    return session.id;
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <Sidebar sessions={sessions} agents={agents} onNewChat={handleNewChat} />
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-900/40 to-black">
        {children}
      </main>
    </div>
  );
}
