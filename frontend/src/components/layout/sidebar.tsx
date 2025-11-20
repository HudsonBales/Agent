"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Agent, Session } from "@/data/types";
import { useState } from "react";
import { clsx } from "clsx";

interface SidebarProps {
  sessions: Session[];
  agents: Agent[];
  onNewChat: (agentId: string) => Promise<string>;
}

export function Sidebar({ sessions, agents, onNewChat }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const activeSessionId = pathname?.split("/").pop();

  async function handleNewChat(agentId: string) {
    try {
      setCreating(true);
      const id = await onNewChat(agentId);
      router.push(`/chat/${id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside className="flex h-full w-72 flex-col gap-5 border-r border-white/5 bg-[#050914] px-4 py-6">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.6em] text-neutral-500">OpsPilot</p>
        <p className="text-lg font-semibold text-white">Studio console</p>
        <p className="text-xs text-neutral-400">Single loop: ask → inspect → ship</p>
      </div>

      <Button
        className="w-full rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:border-white/20"
        onClick={() => handleNewChat(agents[0]?.id || "daily-brief")}
        loading={creating}
      >
        New session
      </Button>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-500">Recent</p>
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/chat/${session.id}`}
              className={clsx(
                "flex flex-col gap-1 rounded-2xl border border-white/5 px-3 py-2 text-sm transition hover:border-white/30 hover:bg-white/5",
                activeSessionId === session.id && "bg-white/10 border-white/30 shadow-[0_10px_20px_rgba(15,23,42,0.4)]"
              )}
            >
              <span className="truncate font-semibold text-white">{session.title}</span>
              <span className="text-xs text-neutral-500">
                {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">Agents</p>
        <div className="space-y-1">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleNewChat(agent.id)}
              className="w-full rounded-2xl border border-white/5 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30"
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
        Minimal chrome, maximum flow.
      </div>
    </aside>
  );
}
