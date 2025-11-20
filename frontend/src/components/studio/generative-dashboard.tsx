"use client";

import { Agent, MCPEvent, MCPWorkflow, MessageBlock, Session, Tool } from "@/data/types";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { listAnomalies, listWorkflows } from "@/lib/api";
import { DataVisualization } from "@/components/studio/data-visualization";

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

export function GenerativeDashboard({ session, agent, tools }: Props) {
  const metrics = useMemo(() => session.mcpData?.metrics ?? findMetrics(session) ?? fallbackMetrics, [session]);
  const churnRows = useMemo(() => session.mcpData?.churnRows ?? findChurn(session) ?? fallbackChurn, [session]);
  
  // State for real-time data
  const [realAnomalies, setRealAnomalies] = useState<any[]>([]);
  const [realWorkflows, setRealWorkflows] = useState<MCPWorkflow[]>([]);
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
        title: workflow.title || workflow.id,
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
    <div className="space-y-5">
      <motion.section
        layout
        className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Instrumentation</p>
            <h2 className="text-lg font-semibold text-neutral-900">Live metrics</h2>
            <p className="text-sm text-neutral-500">
              {connectedTools.length || 0} sources · {session.messages.length} prompts processed
            </p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Live
          </span>
        </div>
        
        <div className="mt-5">
          <DataVisualization metrics={metrics} trendData={trend} />
        </div>
      </motion.section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Generative remediation</p>
            <h3 className="text-lg font-semibold text-neutral-900">Workflows</h3>
          </div>
          <span className="text-xs text-blue-600">Auto mode</span>
        </div>
        <div className="mt-4 space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              <div className="flex items-center justify-between text-neutral-900">
                <p className="font-medium">{workflow.title}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    workflow.status === "Live"
                      ? "bg-green-100 text-green-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {workflow.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500">{workflow.condition}</p>
            </div>
          ))}
          {anomalies.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {anomalies.map((anomaly, index) => (
                <p key={`${anomaly.title}-${index}`} className="text-sm">
                  {anomaly.title}: {anomaly.body}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Execution timeline</p>
          <span className="text-xs text-neutral-500">Realtime stream</span>
        </div>
        <div className="mt-3 space-y-2 text-sm text-neutral-700">
          {eventStream.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-2"
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