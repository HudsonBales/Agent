"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Agent, Session } from "@/data/mock";
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
    <aside className="flex h-full w-72 flex-col border-r border-white/5 bg-neutral-950">
      <div className="p-4">
        <Button
          className="w-full"
          onClick={() => handleNewChat(agents[0]?.id || "daily-brief")}
          loading={creating}
        >
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <p className="px-2 text-xs uppercase tracking-wide text-neutral-500">Recent</p>
        <ul className="mt-3 space-y-1">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/chat/${session.id}`}
                className={clsx(
                  "flex flex-col rounded-lg px-3 py-2 text-sm transition hover:bg-white/5",
                  activeSessionId === session.id && "bg-white/10"
                )}
              >
                <span className="truncate font-medium text-white">{session.title}</span>
                <span className="text-xs text-neutral-400">
                  {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/5 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Agents</p>
          <div className="mt-3 space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleNewChat(agent.id)}
                className="w-full rounded-lg border border-white/5 px-3 py-2 text-left text-sm text-white transition hover:border-white/20"
              >
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-neutral-400">Uses {agent.tools.length} tools</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex gap-2 text-sm text-neutral-400">
          <Link href="/connections" className="hover:text-white">
            Tools & Connections
          </Link>
          <Link href="/settings" className="hover:text-white">
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
