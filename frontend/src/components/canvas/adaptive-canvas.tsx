"use client";

import { Session, MessageBlock } from "@/data/types";
import { listAnomalies, listWorkflows } from "@/lib/api";
import { useChatStream } from "@/components/chat/chat-stream-context";
import { useChatComposer } from "@/components/chat/chat-composer-context";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const fallbackMetrics = [
  { label: "MRR", value: "$24.7k", delta: "+3.2%" },
  { label: "Churn", value: "1.2%", delta: "-0.2%" },
  { label: "Signups", value: "187", delta: "+12" }
];

const fallbackEvents = [
  { id: "evt-1", label: "Stripe invoices reconciled", time: "Just now" },
  { id: "evt-2", label: "Supabase usage ingested", time: "2m" },
  { id: "evt-3", label: "Workflow retry queued", time: "5m" }
];

const fallbackInsights = [
  { id: "insight-1", text: "Billing retries doubled vs last week", category: "incident" },
  { id: "insight-2", text: "Activation dip isolated to EU trials", category: "metric" }
];

const fallbackPlan = [
  { id: "understand", title: "Inspect signals", description: "Pull Stripe + Supabase anomalies" },
  { id: "explain", title: "Explain delta", description: "Correlate DAU, MRR, churn" },
  { id: "act", title: "Run workflow", description: "Retry invoices + ping billing" }
];

function extractLatestBlock(session: Session, type: MessageBlock["type"]) {
  for (let i = session.messages.length - 1; i >= 0; i -= 1) {
    const message = session.messages[i];
    const match = message.blocks?.find((block) => block.type === type);
    if (match) {
      return match;
    }
  }
  return undefined;
}

const sparklinePoints = Array.from({ length: 12 }).map((_, index) => 40 + Math.sin(index / 2) * 10 + index * 2);

type Insight = { id: string; text: string; category: string };
type CanvasEvent = { id: string; label: string; time: string };
type WorkflowNode = { id: string; title: string; description: string };

export function AdaptiveCanvas({ session }: { session: Session }) {
  const { events } = useChatStream();
  const { prefill } = useChatComposer();
  const processedRef = useRef(0);

  const initialPlanBlock = extractLatestBlock(session, "plan") as (MessageBlock & { data?: any }) | undefined;
  const initialSchemaBlock = extractLatestBlock(session, "ui_schema") as (MessageBlock & { data?: any }) | undefined;

  const [metrics, setMetrics] = useState(() => session.mcpData?.metrics ?? fallbackMetrics);
  const [insights, setInsights] = useState<Insight[]>(() => fallbackInsights);
  const [timeline, setTimeline] = useState<CanvasEvent[]>(fallbackEvents);
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>(() => {
    if (initialPlanBlock && typeof initialPlanBlock.data === "object" && initialPlanBlock.data) {
      const steps = (initialPlanBlock.data as any).steps as { id?: string; title?: string; description?: string }[];
      return steps?.map((step) => ({
        id: step.id ?? step.title ?? crypto.randomUUID(),
        title: step.title ?? "Step",
        description: step.description ?? ""
      })) ?? fallbackPlan;
    }
    return fallbackPlan;
  });
  const [schema, setSchema] = useState<any>(initialSchemaBlock?.data ?? null);
  const [incident, setIncident] = useState<{ title: string; description?: string } | null>(null);

  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const [anomalies, workflows] = await Promise.all([listAnomalies(), listWorkflows()]);
        if (anomalies.length > 0) {
          setIncident({ title: anomalies[0].title, description: anomalies[0].description });
        }
        if (workflows.length > 0) {
          setTimeline((prev) => {
            const mapped = workflows.slice(0, 3).map((wf) => ({
              id: wf.id,
              label: wf.status ?? wf.definitionId ?? "Workflow",
              time: new Date(wf.startedAt ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));
            return [...mapped, ...prev].slice(0, 6);
          });
        }
      } catch (error) {
        console.error("Failed to hydrate canvas", error);
      }
    };
    fetchRealtime();
  }, []);

  useEffect(() => {
    if (events.length === 0 || processedRef.current === events.length) return;
    const newEvents = events.slice(processedRef.current);
    processedRef.current = events.length;

    newEvents.forEach((event) => {
      switch (event.type) {
        case "insight":
          setInsights((prev) => [
            { id: `insight-${Date.now()}`, text: event.data.text ?? "New insight", category: event.data.category ?? "metric" },
            ...prev
          ].slice(0, 4));
          break;
        case "plan":
          if (event.data?.steps) {
            setWorkflowNodes(
              event.data.steps.map((step: any) => ({
                id: step.id ?? step.title ?? crypto.randomUUID(),
                title: step.title ?? "Step",
                description: step.description ?? ""
              }))
            );
          }
          break;
        case "ui_schema":
          setSchema(event.data);
          break;
        case "anomaly":
          setIncident({ title: event.data.title ?? "Anomaly detected", description: event.data.description });
          break;
        case "tool_call":
          if (event.data?.status === "finished" && event.data.result?.series) {
            setMetrics(
              event.data.result.series.map((entry: any, index: number) => ({
                label: entry.metric ?? `Signal ${index + 1}`,
                value: `${entry.value ?? entry.data ?? ""}`,
                delta: entry.delta ?? undefined
              }))
            );
          }
          setTimeline((prev) => [
            {
              id: `tool-${Date.now()}`,
              label: `${event.data.toolId ?? "Tool"} · ${event.data.status}`,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            },
            ...prev
          ].slice(0, 6));
          break;
        case "workflow":
          setTimeline((prev) => [
            {
              id: event.data.id ?? `wf-${Date.now()}`,
              label: event.data.reason ?? event.data.status ?? "Workflow run",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            },
            ...prev
          ].slice(0, 6));
          break;
        default:
          break;
      }
    });
  }, [events]);

  const schemaPanels = useMemo(() => {
    if (!schema?.layout?.panels) return [];
    return schema.layout.panels as { type?: string; title?: string; metrics?: string[] }[];
  }, [schema]);

  return (
    <div className="flex h-full flex-col gap-4 rounded-[32px] border border-white/10 bg-black/40 p-5 shadow-[0_30px_120px_rgba(2,4,9,0.8)]">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Adaptive canvas</p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">{session.title || "Realtime overview"}</h3>
          <span className="text-xs text-white/50">Workspace {session.workspaceId}</span>
        </div>
        <AnimatePresence>
          {incident && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            >
              <div>
                <p className="font-semibold">{incident.title}</p>
                {incident.description && <p className="text-xs text-red-200">{incident.description}</p>}
              </div>
              <button
                type="button"
                className="rounded-full border border-red-400/50 px-3 py-1 text-xs"
                onClick={() => prefill(`Explain ${incident.title} and recommend a fix.`)}
              >
                Investigate
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            type="button"
            onClick={() => prefill(`Explain the change in ${metric.label}.`)}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white transition hover:border-white/40"
          >
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">{metric.label}</p>
            <p className="text-2xl font-semibold">{metric.value}</p>
            {metric.delta && <p className="text-xs text-emerald-300">{metric.delta}</p>}
          </button>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Live trend</p>
        <div className="h-36">
          <svg viewBox="0 0 300 120" className="h-full w-full">
            <defs>
              <linearGradient id="trend" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={sparklinePoints
                .map((value, index) => `${index === 0 ? "M" : "L"}${(index / (sparklinePoints.length - 1)) * 300} ${120 - value}`)
                .join(" ")}
              fill="none"
              stroke="url(#trend)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Workflow graph</p>
          <div className="relative mt-4 space-y-4">
            {workflowNodes.map((node, index) => (
              <div key={node.id} className="relative pl-6">
                <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed]" />
                {index < workflowNodes.length - 1 && (
                  <span className="absolute left-1.5 top-5 h-6 w-px bg-white/20" />
                )}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <p className="text-sm font-semibold text-white">{node.title}</p>
                  <p className="text-xs text-white/60">{node.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Insights</p>
          <div className="mt-3 space-y-3">
            {insights.map((insight) => (
              <motion.button
                key={insight.id}
                onClick={() => prefill(`Explain ${insight.text}`)}
                whileHover={{ scale: 1.01 }}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-left text-sm"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">{insight.category}</p>
                <p className="text-white">{insight.text}</p>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Event Stream</p>
          <div className="mt-3 space-y-2">
            {timeline.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 px-3 py-2 text-sm text-white/80">
                <span>{item.label}</span>
                <span className="text-xs text-white/50">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        {schemaPanels.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Generated layout</p>
            <div className="mt-3 grid gap-3">
              {schemaPanels.map((panel, index) => (
                <div key={`${panel.title}-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-sm font-semibold text-white">{panel.title ?? panel.type ?? "Panel"}</p>
                  {panel.metrics && (
                    <p className="text-xs text-white/50">{panel.metrics.join(" · ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
