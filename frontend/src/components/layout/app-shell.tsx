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
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-white">
      <Sidebar sessions={sessions} agents={agents} onNewChat={handleNewChat} />
      <main className="flex-1 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#05070f] to-black">
        <div className="h-full overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
