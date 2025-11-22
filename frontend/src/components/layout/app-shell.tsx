"use client";

import { ReactNode, useMemo, useState } from "react";
import { Agent, Session } from "@/data/types";
import { usePathname, useRouter } from "next/navigation";
import { createSession } from "@/lib/api";
import { ArrowUpRight } from "lucide-react";
import type { Integration } from "@/lib/integrations";
import { OnboardingConnectPanel } from "@/components/onboarding/connect-panel";
import clsx from "clsx";

type RitualConfig = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  agentId?: string;
};

interface Props {
  children: ReactNode;
  sessions: Session[];
  agents: Agent[];
  activeSessionId?: string;
  integrations?: Integration[];
  hideOnboarding?: boolean;
}

export function AppShell({ children, sessions, agents, activeSessionId, integrations, hideOnboarding }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [creating, setCreating] = useState(false);
  const [ritualLoading, setRitualLoading] = useState<string | null>(null);
  const defaultAgentId = agents[0]?.id ?? "agent-daily-brief";

  async function handleNewChat(agentId: string, initialMessage?: string) {
    const session = await createSession(initialMessage ?? "", agentId);
    return session.id;
  }

  async function handleNewSession() {
    try {
      setCreating(true);
      const targetAgent = defaultAgentId;
      if (!targetAgent) {
        return;
      }
      const id = await handleNewChat(targetAgent);
      router.push(`/chat/${id}`);
    } finally {
      setCreating(false);
    }
  }

  async function launchRitual(ritual: RitualConfig) {
    const agentId = ritual.agentId ?? defaultAgentId;
    if (!agentId) {
      return;
    }
    try {
      setRitualLoading(ritual.id);
      const id = await handleNewChat(agentId, ritual.prompt);
      router.push(`/chat/${id}`);
    } finally {
      setRitualLoading(null);
    }
  }

  const activeIndex = useMemo(() => sessions.findIndex((session) => session.id === activeSessionId), [sessions, activeSessionId]);
  const commandConsoleHref = activeSessionId
    ? `/chat/${activeSessionId}`
    : sessions[0]
      ? `/chat/${sessions[0].id}`
      : "/chat";

  const navLinks = [
    { label: "Command Console", href: commandConsoleHref },
    { label: "Instruments", href: "/connections" },
    { label: "Minds", href: "/agents" },
    { label: "Automations", href: "/settings?panel=automations" },
    { label: "Museum", href: "/settings?panel=history" }
  ];

  const rituals: RitualConfig[] = [
    {
      id: "morning-brief",
      label: "Morning Brief",
      description: "Stripe + Supabase pulse in 90 seconds.",
      prompt: "Run the morning brief. Combine Stripe ARR/MRR trends, Supabase activation, and current incidents into five bullet insights. Recommend the single highest leverage action."
    },
    {
      id: "incident-drill",
      label: "Incident Drill",
      description: "Correlate anomalies with MCP tools.",
      prompt: "Treat this like an incident drill. Stripe webhooks are flapping and churn spiked. Pull telemetry from Stripe + Supabase, list impacted customers, and propose remediation workflow plus comms."
    },
    {
      id: "revenue-experiment",
      label: "Revenue Experiment",
      description: "Design the next growth play.",
      prompt: "Design a revenue experiment that reduces churn using Supabase analytics + Notion docs context. Output hypothesis, metrics to watch, and automation steps to launch it."
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#020409] text-white">
      <aside className="hidden w-[19rem] shrink-0 flex-col border-r border-white/5 bg-[#05060f]/90 px-5 py-6 backdrop-blur xl:flex">
        <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
          <span>Ops Graph</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60">Live</span>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <nav className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Systems</p>
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={() => router.push(link.href)}
                className={clsx(
                  "w-full rounded-2xl border px-3 py-2 text-left text-sm font-semibold tracking-wide text-white/80 transition hover:border-white/30 hover:bg-white/5",
                  pathname?.startsWith(link.href.split("?")[0]) ? "border-white/30 bg-white/5 text-white" : "border-white/10 bg-transparent"
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <section className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Rituals</p>
            <div className="space-y-2">
              {rituals.map((ritual) => (
                <button
                  type="button"
                  key={ritual.id}
                  onClick={() => launchRitual(ritual)}
                  disabled={!defaultAgentId || ritualLoading === ritual.id}
                  className="w-full rounded-3xl border border-white/10 px-4 py-3 text-left text-sm text-white transition hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">{ritual.label}</p>
                      <p className="text-sm font-semibold text-white">{ritual.description}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/60" />
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    {ritualLoading === ritual.id ? "Summoning…" : "Tap to launch"}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Active runs</p>
            <div className="space-y-2">
              {sessions.map((session, index) => (
                <button
                  type="button"
                  key={session.id}
                  onClick={() => router.push(`/chat/${session.id}`)}
                  className={clsx(
                    "w-full rounded-2xl border px-3 py-2 text-left text-sm transition hover:border-white/40 hover:bg-white/5",
                    session.id === activeSessionId ? "border-white/40 bg-white/5" : "border-white/10 bg-transparent"
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Run {sessions.length - index}</p>
                  <p className="truncate text-white">{session.title || "Untitled session"}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 text-xs text-white/60">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Agents online</p>
            <div className="space-y-2">
              {agents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-white">{agent.name}</p>
                    <p className="text-[11px] text-white/50">{(agent.toolsWhitelist ?? agent.tools ?? []).length} tools</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-6 text-[11px] uppercase tracking-[0.4em] text-white/40">Ask → inspect → ship.</div>
      </aside>
      <div className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Adaptive ops console</p>
            <h1 className="text-2xl font-semibold text-white">Gemini Canvas</h1>
          </div>
          <button
            type="button"
            onClick={handleNewSession}
            disabled={creating || agents.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-2xl disabled:opacity-50"
          >
            {creating ? "Summoning…" : "Start a new run"}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">{children}</main>
        {hideOnboarding ? null : <OnboardingConnectPanel integrations={integrations} />}
      </div>
    </div>
  );
}
