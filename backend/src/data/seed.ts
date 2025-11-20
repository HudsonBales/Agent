import { nanoid } from "nanoid";
import {
  Agent,
  AgentTrigger,
  Anomaly,
  Insight,
  MetricSeries,
  Session,
  UISchema,
  WorkflowDefinition,
  Workspace
} from "../types";

const now = () => new Date().toISOString();

const defaultTriggers: AgentTrigger[] = [
  { type: "manual", details: {} },
  { type: "schedule", details: { cron: "0 13 * * 1-5" } }
];

const workspaces: Workspace[] = [
  {
    id: "ws-demo",
    name: "Indie SaaS Playground",
    timezone: "America/Los_Angeles",
    defaultAgentId: "agent-daily-brief",
    createdAt: now()
  }
];

const agents: Agent[] = [
  {
    id: "agent-daily-brief",
    workspaceId: "ws-demo",
    name: "Daily Brief",
    description: "Summarizes key SaaS KPIs and anomalies every morning.",
    systemPrompt:
      "You are the Daily Brief agent. Provide crisp summaries with remediation recommendations when signals shift.",
    toolsWhitelist: ["stripe.metrics", "supabase.analytics", "slack.notify", "notion.pages"],
    defaultInputRole: "user",
    triggers: defaultTriggers,
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "agent-ops",
    workspaceId: "ws-demo",
    name: "Ops Brain",
    description: "Understands incidents and proposes workflows to resolve them.",
    systemPrompt: "You are the ops brain; focus on incidents, workflows, and automation.",
    toolsWhitelist: ["stripe.metrics", "linear.issues", "slack.notify", "supabase.analytics"],
    defaultInputRole: "user",
    triggers: [{ type: "event", details: { source: "signals", metric: "conversion_rate" } }],
    createdAt: now(),
    updatedAt: now()
  }
];

const sessions: Session[] = [
  {
    id: "sess-support",
    workspaceId: "ws-demo",
    title: "Daily Brief – Support Trends",
    activeAgentId: "agent-daily-brief",
    model: "gpt-4o-mini",
    createdAt: now(),
    updatedAt: now(),
    messages: [
      {
        id: `msg-${nanoid(6)}`,
        sessionId: "sess-support",
        role: "user",
        content: "Give me today's overview and highlight anything urgent.",
        createdAt: now()
      },
      {
        id: `msg-${nanoid(6)}`,
        sessionId: "sess-support",
        role: "assistant",
        content: "Previous assistant message placeholder from mock orchestration.",
        createdAt: now()
      }
    ]
  }
];

const workflows: WorkflowDefinition[] = [
  {
    id: "wf-stripe-retry",
    workspaceId: "ws-demo",
    name: "Retry Stripe Subscription Sync",
    description: "Retries failed subscription syncs and alerts billing if retries fail.",
    trigger: { type: "event", details: { source: "stripe", event: "invoice.payment_failed" } },
    steps: [
      { id: "step-1", type: "tool", name: "Fetch failed invoices", toolId: "stripe.list_failed", input: {} },
      {
        id: "step-2",
        type: "tool",
        name: "Retry subscription sync",
        toolId: "supabase.sync_subscription",
        input: { retries: 3 }
      },
      {
        id: "step-3",
        type: "notify",
        name: "Alert billing",
        toolId: "slack.notify_channel",
        input: { channel: "#billing", template: "Stripe sync issue persisted after retries." }
      }
    ],
    createdAt: now(),
    updatedAt: now()
  }
];

const metrics: MetricSeries[] = [
  {
    id: "metric-mrr",
    workspaceId: "ws-demo",
    name: "Monthly Recurring Revenue",
    unit: "usd",
    points: Array.from({ length: 10 }).map((_, idx) => ({
      timestamp: new Date(Date.now() - (9 - idx) * 86_400_000).toISOString(),
      value: 4200 + idx * 120 + (idx % 2 === 0 ? 50 : -30)
    }))
  },
  {
    id: "metric-conversion",
    workspaceId: "ws-demo",
    name: "Trial to Paid Conversion",
    unit: "percent",
    points: Array.from({ length: 10 }).map((_, idx) => ({
      timestamp: new Date(Date.now() - (9 - idx) * 86_400_000).toISOString(),
      value: 8 + (idx > 6 ? -1.2 : 0) + Math.random()
    }))
  }
];

const anomalies: Anomaly[] = [
  {
    id: "anom-conversion-drop",
    workspaceId: "ws-demo",
    metricId: "metric-conversion",
    title: "Conversion dropped 20% vs baseline",
    description: "Trial to paid conversion dipped after the latest onboarding release.",
    severity: "high",
    detectedAt: now(),
    baseline: 9.5,
    observed: 7.4
  }
];

const insights: Insight[] = [
  {
    id: "insight-eu-churn",
    workspaceId: "ws-demo",
    text: "EU churn increased 12% following the billing change rollout.",
    category: "metric",
    createdAt: now()
  },
  {
    id: "insight-support",
    workspaceId: "ws-demo",
    text: "Support tickets mentioning onboarding latency tripled week-over-week.",
    category: "incident",
    createdAt: now()
  }
];

const uiSchemas: UISchema[] = [
  {
    id: "ui-dashboard",
    workspaceId: "ws-demo",
    context: "main_dashboard",
    version: 1,
    layout: {
      hero: { title: "Daily Ops Pulse", subtitle: "Live metrics & incidents" },
      panels: [
        { type: "metric_trio", metrics: ["metric-mrr", "metric-conversion"] },
        { type: "anomaly_feed", source: "signals" },
        { type: "workflow_shortcuts", workflows: ["wf-stripe-retry"] }
      ]
    },
    createdAt: now()
  }
];

export const seedData = {
  workspaces,
  agents,
  sessions,
  workflows,
  metrics,
  anomalies,
  uiSchemas,
  insights
};
