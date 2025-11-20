"use client";

import { Agent, MCPEvent, MCPWorkflow, MessageBlock, Session, Tool } from "@/data/types";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listAnomalies, listWorkflows } from "@/lib/api";

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

const fallbackAnomalies: ErrorBlock[] = [
  { type: "error", title: "Payment failures +40%", body: "Stripe webhooks slowed after deploy e1a32a." },
  { type: "error", title: "Conversion dip in EU", body: "Trial → paid down 14% vs rolling baseline." }
];

export function GenerativeConsole({ session, agent, tools }: Props) {
  const metrics = useMemo(() => session.mcpData?.metrics ?? findMetrics(session) ?? fallbackMetrics, [session]);
  const churnRows = useMemo(() => session.mcpData?.churnRows ?? findChurn(session) ?? fallbackChurn, [session]);
  
  // State for real-time data
  const [realAnomalies, setRealAnomalies] = useState<any[]>([]);
  const [realWorkflows, setRealWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch real anomaly and workflow data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anomalies, workflows] = await Promise.all([
          listAnomalies(),
          listWorkflows()
        ]);
        setRealAnomalies(anomalies);
        setRealWorkflows(workflows);
      } catch (error) {
        console.error("Failed to fetch real data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Use real anomalies if available, otherwise fallback to session data
  const anomalies = useMemo(() => {
    if (realAnomalies.length > 0) {
      return realAnomalies.map(anomaly => ({
        type: "error",
        title: anomaly.title,
        body: anomaly.description || ""
      }));
    }
    
    const raw = (session.mcpData?.anomalies ?? findAnomalies(session)) ?? [];
    return raw.length > 0 ? raw : fallbackAnomalies;
  }, [realAnomalies, session]);
  
  // Use real workflows if available, otherwise fallback
  const workflows = useMemo(() => {
    if (realWorkflows.length > 0) {
      return realWorkflows.map(workflow => ({
        id: workflow.id,
        title: workflow.definitionId || workflow.id,
        condition: workflow.status || "Unknown",
        channel: "System",
        status: workflow.status || "Draft"
      }));
    }
    
    return session.mcpData?.workflows ?? fallbackWorkflows;
  }, [realWorkflows, session]);
  
  const [activeMetric, setActiveMetric] = useState(metrics[0]?.label ?? "MRR");

  const trend = useMemo(() => {
    const bias = activeMetric.length;
    return fallbackTrend.map((point, index) => ({
      ...point,
      value: point.value + (index % 2 === 0 ? 4 : -3) + (bias % 2 === 0 ? 2 : -1)
    }));
  }, [activeMetric]);

  const connectedTools = tools.filter((tool) => (agent?.tools ?? []).includes(tool.id));

  const eventStream = session.mcpData?.eventStream ?? fallbackEventStream;
  const activeAnomaly = anomalies[0];

  return (
    <div className="space-y-4">
      <motion.section
        layout
        className="rounded-3xl border border-white/10 bg-[#060c1a] p-5 shadow-[0_25px_90px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Instrumentation</p>
            <h2 className="text-lg font-semibold text-white">Live metrics</h2>
            <p className="text-sm text-neutral-400">
              {connectedTools.length || 0} sources · {session.messages.length} prompts processed
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
            Live
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {metrics.map((metric) => (
            <button
              key={metric.label}
              onClick={() => setActiveMetric(metric.label)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeMetric === metric.label ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-black/40 text-white/70"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              {metric.delta && <p className="text-xs text-emerald-400">{metric.delta} vs last week</p>}
            </button>
          ))}
        </div>
      </motion.section>

      <section className="rounded-3xl border border-white/10 bg-[#070b16] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Insight</p>
            <h3 className="text-lg font-semibold text-white">{activeMetric} focus</h3>
          </div>
          <span className="text-xs text-neutral-400">Updated live</span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b1325] p-4 text-sm text-neutral-200">
            <p>Fastest movement inside Growth tier. Trial-to-paid dropped 14% WoW.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-white/10 px-3 py-1">Retry invoices</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Notify billing</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Reconcile logs</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070c17] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Generative remediation</p>
            <h3 className="text-lg font-semibold text-white">Workflows</h3>
          </div>
          <span className="text-xs text-emerald-300">Auto mode</span>
        </div>
        <div className="mt-4 space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-neutral-200">
              <div className="flex items-center justify-between text-white">
                <p className="font-semibold">{workflow.title}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    workflow.status === "Live"
                      ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border border-neutral-500/40 text-neutral-300"
                  }`}
                >
                  {workflow.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{workflow.condition}</p>
            </div>
          ))}
          {anomalies.length > 0 && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
              {anomalies.map((anomaly, index) => (
                <p key={`${anomaly.title}-${index}`} className="text-sm">
                  {anomaly.title}: {anomaly.body}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070914] p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Execution timeline</p>
          <span className="text-xs text-neutral-400">Realtime stream</span>
        </div>
        <div className="mt-3 space-y-2 text-sm text-neutral-400">
          {eventStream.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 px-4 py-2"
            >
              <span>{event.label}</span>
              <span className="text-xs text-neutral-500">{event.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
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
