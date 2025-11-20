"use client";

import { ReactNode, useState } from "react";
import { Agent, Session } from "@/data/types";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/api";
import { Menu } from "lucide-react";

interface Props {
  children: ReactNode;
  sessions: Session[];
  agents: Agent[];
}

export function AppShell({ children, sessions, agents }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleNewChat(agentId: string) {
    const session = await createSession("", agentId);
    return session.id;
  }

  async function handleNewSession() {
    try {
      setCreating(true);
      const id = await handleNewChat(agents[0]?.id || "daily-brief");
      router.push(`/chat/${id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1f1f1f]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-6 sm:px-8">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-300"
              aria-label="Open main menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-lg font-semibold tracking-tight">Gemini</p>
          </div>
          <button
            type="button"
            onClick={handleNewSession}
            disabled={creating || agents.length === 0}
            className="rounded-full bg-[#1a73e8] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#155ec2] disabled:opacity-50"
          >
            {creating ? "Signing in…" : "Sign in"}
          </button>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
