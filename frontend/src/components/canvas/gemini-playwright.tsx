"use client";

import { Agent, MCPDataSource, Message, Session, Tool } from "@/data/types";

const fallbackMetrics = [
  { label: "MRR", value: "$24.7k", delta: "+3.2%" },
  { label: "Open trials", value: "312", delta: "+24" },
  { label: "Churn risk", value: "1.1%", delta: "-0.3%" },
  { label: "Workflow hits", value: "48", delta: "+6" }
];

const fallbackEvents = [
  { id: "evt-1", label: "Playwright MCP heartbeat", time: "just now" },
  { id: "evt-2", label: "Stripe schema refreshed", time: "2m ago" },
  { id: "evt-3", label: "Gemini plan drafted", time: "5m ago" }
];

const fallbackDataSources: MCPDataSource[] = [
  { name: "Stripe", description: "Payments", status: "synthetic paired" },
  { name: "Supabase", description: "Analytics", status: "streaming 142 req/s" },
  { name: "Linear", description: "Support automations", status: "connected" }
];

const fallbackPreview: Message[] = [
  {
    id: "preview-1",
    role: "assistant",
    content: "Gemini is listening. Give me a prompt and I’ll build a canvas with the same polish as Playwright MCP.",
    createdAt: new Date().toISOString()
  }
];

interface Props {
  session: Session;
  agent?: Agent;
  tools: Tool[];
}

export function GeminiPlaywright({ session, agent, tools }: Props) {
  const metrics = session.mcpData?.metrics ?? fallbackMetrics;
  const dataSources = session.mcpData?.dataSources ?? fallbackDataSources;
  const events = session.mcpData?.eventStream ?? fallbackEvents;

  const previewMessages = session.messages.length > 0 ? session.messages.slice(-3) : fallbackPreview;
  const connectedTools = tools.filter((tool) => (agent?.tools ?? []).includes(tool.id));

  return (
    <section className="rounded-[34px] border border-white/10 bg-gradient-to-br from-[#03030c] via-[#050418] to-[#010307] p-6 shadow-[0_40px_90px_rgba(0,0,0,0.75)]">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#11163b] to-[#02030c] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-neutral-400">
                  Gemini Studio · Playwright MCP
                </p>
                <p className="text-sm font-semibold text-white">Command preview</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Live
              </span>
            </div>
            <div className="mt-5 space-y-3 rounded-[28px] border border-white/5 bg-black/60 p-4 text-sm leading-relaxed text-neutral-100 backdrop-blur">
              {previewMessages.map((message) => (
                <div key={message.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                    <span>{message.role === "user" ? "You" : "Gemini"}</span>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-base text-white">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
              <span className="rounded-full border border-white/10 px-3 py-1">{agent?.name ?? "OpsPilot"} · Gemini</span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Sources · {connectedTools.length || "0"} connected
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Model · {session.model ?? "Gemini 2.5 Pro"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-400">Playwright MCP metrics</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metrics.slice(0, 4).map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">{metric.label}</p>
                  <p className="text-lg font-semibold text-white">{metric.value}</p>
                  {metric.delta && <p className="text-[11px] text-emerald-400">{metric.delta}</p>}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-500">Auto-synced from MCP servers every 30s.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#050713] to-[#080515] p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-400">Stream events</p>
              <span className="text-xs text-neutral-500">Gemini·Playwright</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-neutral-300">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 px-3 py-2"
                >
                  <p>{event.label}</p>
                  <span className="text-[11px] text-neutral-500">{event.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-400">Data sources</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-200">
              {dataSources.map((source) => (
                <span key={source.name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {source.name} · {source.status}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-neutral-500">
              Gemini’s UI combines Playwright MCP streams and data for a smooth studio experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
