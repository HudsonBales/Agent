"use client";

import { Agent, MCPDataSource, MCPEvent, MCPWorkflow, MessageBlock, Session, Tool } from "@/data/mock";
import { ReactNode, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  session: Session;
  agent?: Agent;
  tools: Tool[];
};

type MetricsBlock = Extract<MessageBlock, { type: "metrics" }>;
type TableBlock = Extract<MessageBlock, { type: "table" }>;
type ErrorBlock = Extract<MessageBlock, { type: "error" }>;

const fallbackMetrics: MetricsBlock["metrics"] = [
  { label: "MRR", value: "$24.7k", delta: "+3.2%" },
  { label: "Churn", value: "1.2%", delta: "-0.2%" },
  { label: "Signups", value: "187", delta: "+12" }
];

const fallbackChurn: TableBlock["rows"] = [
  ["Scale", "0.9%", "Stable"],
  ["Growth", "1.7%", "Needs Attention"],
  ["Starter", "2.4%", "Improving"]
];

const fallbackTrend = [
  { label: "Mon", value: 48 },
  { label: "Tue", value: 55 },
  { label: "Wed", value: 62 },
  { label: "Thu", value: 67 },
  { label: "Fri", value: 72 },
  { label: "Sat", value: 70 },
  { label: "Sun", value: 75 }
];

const fallbackWorkflows: MCPWorkflow[] = [
  {
    id: "fallback-trial-alert",
    title: "Trial → Paid watchdog",
    condition: "Alert at -15% WoW",
    channel: "Slack #gtm-ops",
    status: "Live"
  },
  {
    id: "fallback-webhook",
    title: "Stripe webhook resiliency",
    condition: "Retries 3x + route to Linear",
    channel: "Automation",
    status: "Draft"
  }
];

const fallbackEventStream: MCPEvent[] = [
  { id: "evt-1", label: "Stripe invoices synced", time: "Just now" },
  { id: "evt-2", label: "Supabase usage ingested", time: "2m ago" },
  { id: "evt-3", label: "Churn anomaly scan complete", time: "5m ago" },
  { id: "evt-4", label: "Slack alert delivered", time: "12m ago" }
];

export function GenerativeConsole({ session, agent, tools }: Props) {
  const metrics = useMemo(() => session.mcpData?.metrics ?? findMetrics(session) ?? fallbackMetrics, [session]);
  const churnRows = useMemo(() => session.mcpData?.churnRows ?? findChurn(session) ?? fallbackChurn, [session]);
  const anomalies = useMemo(() => session.mcpData?.anomalies ?? findAnomalies(session), [session]);
  const [activeMetric, setActiveMetric] = useState(metrics[0]?.label ?? "MRR");

  const trend = useMemo(() => {
    const bias = activeMetric.length;
    return fallbackTrend.map((point, index) => ({
      ...point,
      value: point.value + (index % 2 === 0 ? 4 : -3) + (bias % 2 === 0 ? 2 : -1)
    }));
  }, [activeMetric]);

  const connectedTools = tools.filter((tool) => (agent?.tools ?? []).includes(tool.id));
  const dataSources = session.mcpData?.dataSources ?? connectedTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    status: tool.connected ? "Streaming" : "Connect"
  }));

  const workflows = session.mcpData?.workflows ?? fallbackWorkflows;
  const eventStream = session.mcpData?.eventStream ?? fallbackEventStream;

  return (
    <div className="flex flex-col gap-4">
      <motion.section
        layout
        className="rounded-3xl border border-white/5 bg-gradient-to-b from-[#111530] via-[#060914] to-black p-6 shadow-card"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Auto Instrumentation</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Business telemetry streaming</h2>
            <p className="text-sm text-neutral-400">
              OAuth complete · MCP schemas hydrated · Listening to {connectedTools.length || 0} systems
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-100">
            Live
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <button
              key={metric.label}
              onClick={() => setActiveMetric(metric.label)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeMetric === metric.label
                  ? "border-brand bg-brand/10 text-white"
                  : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-neutral-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              {metric.delta && <p className="text-xs text-emerald-400">{metric.delta} vs last week</p>}
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section layout className="rounded-3xl border border-white/5 bg-black/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Derived dashboard</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{activeMetric} focus</h3>
          </div>
          <span className="text-xs text-neutral-400">Regenerates after every prompt</span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5">
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>Weekly signal</span>
              <span>Auto forecast</span>
            </div>
            <div className="mt-6 flex h-44 items-end gap-3">
              {trend.map((point) => (
                <div key={point.label} className="flex flex-col items-center gap-2 text-xs text-neutral-500">
                  <div
                    className="w-8 rounded-2xl bg-gradient-to-t from-brand/20 to-brand/80 shadow-card"
                    style={{ height: `${point.value}%` }}
                  />
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Insight</p>
              <p className="mt-2 text-white">
                Fastest movement inside <span className="text-brand">Growth</span> tier. Trial-to-paid dropped 14% WoW.
              </p>
            </div>
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-100">
              Proposed automation · Retry churned invoices + Slack ops-review.
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-xs text-neutral-400">Next Steps</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-200">
                <li>Slice conversion by plan</li>
                <li>Deploy conversion monitor rule</li>
                <li>Open Supabase session recordings</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      <CollapsibleSection title="Data Sources">
        <div className="space-y-3">
          {dataSources.map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/0 p-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{source.name}</p>
                <p className="text-xs text-neutral-500">{source.description}</p>
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                {source.status}
              </span>
            </div>
          ))}
          {dataSources.length === 0 && (
            <p className="text-sm text-neutral-500">Connect Stripe, Supabase, and more to see dashboards bloom.</p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Churn intelligence">
        <div className="rounded-2xl border border-white/5">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Churn</th>
                <th className="px-4 py-3">Signal</th>
              </tr>
            </thead>
            <tbody>
              {churnRows.map((row, index) => (
                <tr key={`${row[0]}-${index}`} className="border-b border-white/5 text-white/80">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Workflows & Alerts">
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-200">
              <div className="flex flex-wrap items-center justify-between gap-2 text-white">
                <p className="text-base font-semibold">{workflow.title}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    workflow.status === "Live"
                      ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border border-yellow-500/40 bg-yellow-500/10 text-yellow-100"
                  }`}
                >
                  {workflow.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{workflow.condition}</p>
              <p className="text-xs text-neutral-500">Notifies via {workflow.channel}</p>
            </div>
          ))}
        </div>
        {anomalies.length > 0 && (
          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="font-semibold">Live issue detected</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-red-100">
              {anomalies.map((anomaly, index) => (
                <li key={`${anomaly.title}-${index}`}>
                  {anomaly.title} — {anomaly.body}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Event stream" defaultOpen={false}>
        <div className="space-y-2 text-sm text-neutral-400">
          {eventStream.map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 px-4 py-3">
              <span>{event.label}</span>
              <span className="text-xs text-neutral-500">{event.time}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-3xl border border-white/5 bg-white/5 p-5">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm text-white"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Generative panel</p>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className="text-xs text-neutral-400">{open ? "Hide" : "Reveal"}</span>
      </button>
      {open && <div className="mt-4 space-y-3">{children}</div>}
    </section>
  );
}

function findMetrics(session: Session) {
  for (const message of session.messages) {
    const block = message.blocks?.find((blk): blk is MetricsBlock => blk?.type === "metrics");
    if (block) {
      return block.metrics;
    }
  }
  return undefined;
}

function findChurn(session: Session) {
  for (const message of session.messages) {
    const block = message.blocks?.find((blk): blk is TableBlock => blk?.type === "table");
    if (block) {
      return block.rows;
    }
  }
  return undefined;
}

function findAnomalies(session: Session) {
  const anomalies: ErrorBlock[] = [];
  for (const message of session.messages) {
    const block = message.blocks?.find((blk): blk is ErrorBlock => blk?.type === "error");
    if (block) {
      anomalies.push(block);
    }
  }
  return anomalies;
}
