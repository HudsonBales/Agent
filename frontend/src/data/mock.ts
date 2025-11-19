import { nanoid } from "nanoid";

export type Tool = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  category: "payments" | "email" | "docs" | "support";
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  trigger?: string;
};

export type MessageBlock =
  | { type: "text"; content: string }
  | {
      type: "metrics";
      metrics: { label: string; value: string; delta?: string }[];
    }
  | {
      type: "table";
      columns: string[];
      rows: string[][];
    }
  | { type: "error"; title: string; body: string };

export type MCPMetric = {
  label: string;
  value: string;
  delta?: string;
};

export type MCPWorkflow = {
  id: string;
  title: string;
  condition: string;
  channel: string;
  status: "Live" | "Draft";
};

export type MCPEvent = {
  id: string;
  label: string;
  time: string;
};

export type MCPDataSource = {
  name: string;
  description: string;
  status: string;
};

export type MCPData = {
  metrics?: MCPMetric[];
  churnRows?: string[][];
  anomalies?: { title: string; body: string }[];
  workflows?: MCPWorkflow[];
  eventStream?: MCPEvent[];
  dataSources?: MCPDataSource[];
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  createdAt: string;
  blocks?: MessageBlock[];
  toolName?: string;
};

export type Session = {
  id: string;
  title: string;
  activeAgentId: string;
  messages: Message[];
  updatedAt: string;
  mcpData?: MCPData;
};

export const tools: Tool[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payments & subscriptions",
    connected: true,
    category: "payments"
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Support inbox",
    connected: true,
    category: "email"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Docs & runbooks",
    connected: false,
    category: "docs"
  },
  {
    id: "linear",
    name: "Linear",
    description: "Issue tracking",
    connected: true,
    category: "support"
  }
];

export const agents: Agent[] = [
  {
    id: "daily-brief",
    name: "Daily Brief",
    description: "Summarizes key SaaS metrics every morning",
    systemPrompt: "You are a COO-level assistant...",
    tools: ["stripe", "gmail", "linear"],
    trigger: "0 9 * * 1-5"
  },
  {
    id: "support-ally",
    name: "Support Ally",
    description: "Helps triage urgent support",
    systemPrompt: "Escalate urgent customers",
    tools: ["gmail", "linear"]
  },
  {
    id: "launch-buddy",
    name: "Launch Buddy",
    description: "Creates launch plans",
    systemPrompt: "Act as a product marketer",
    tools: ["notion"]
  }
];

const now = new Date().toISOString();

export const sessions: Session[] = [
  {
    id: "sess-daily",
    title: "What happened yesterday?",
    activeAgentId: "daily-brief",
    updatedAt: now,
    messages: [
      {
        id: nanoid(),
        role: "user",
        content: "What should I know about my business since yesterday?",
        createdAt: now
      },
      {
        id: nanoid(),
        role: "assistant",
        content: "Here's your daily brief.",
        createdAt: now,
        blocks: [
          {
            type: "metrics",
            metrics: [
              { label: "MRR", value: "$24.7k", delta: "+3.2%" },
              { label: "Churn", value: "1.2%", delta: "-0.2%" },
              { label: "Signups", value: "187", delta: "+12" }
            ]
          },
          {
            type: "table",
            columns: ["Customer", "Issue", "Status"],
            rows: [
              ["Acme Inc", "Payment retries failing", "Investigating"],
              ["PixelPlay", "Upgrade request", "Needs reply"],
              ["Northwind", "Churn risk", "Agent reviewing"]
            ]
          }
        ]
      }
    ],
    mcpData: {
      metrics: [
        { label: "MRR", value: "$24.7k", delta: "+3.2%" },
        { label: "Churn", value: "1.2%", delta: "-0.2%" },
        { label: "Trials → Paid", value: "68%", delta: "-3.5%" }
      ],
      churnRows: [
        ["Scale", "0.9%", "Stable"],
        ["Growth", "1.7%", "Needs attention"],
        ["Starter", "2.4%", "Improving"]
      ],
      workflows: [
        {
          id: "trial-alert",
          title: "Trial → Paid watchdog",
          condition: "Alert at -15% WoW",
          channel: "Slack #gtm-ops",
          status: "Live"
        },
        {
          id: "webhook-retry",
          title: "Stripe webhook resiliency",
          condition: "Retries 3x + notify Linear",
          channel: "Automation",
          status: "Draft"
        }
      ],
      eventStream: [
        { id: "evt-1", label: "Stripe invoices synced", time: "Just now" },
        { id: "evt-2", label: "Supabase usage ingested", time: "2m ago" },
        { id: "evt-3", label: "Churn anomaly scan complete", time: "5m ago" },
        { id: "evt-4", label: "Slack alert delivered", time: "12m ago" }
      ],
      dataSources: [
        { name: "Stripe", description: "Payments + subscriptions", status: "Streaming schema v4.2" },
        { name: "Supabase", description: "Analytics + logs", status: "Streaming 102 req/s" },
        { name: "Linear", description: "Support automations", status: "Connected" }
      ]
    }
  },
  {
    id: "sess-support",
    title: "Support triage",
    activeAgentId: "support-ally",
    updatedAt: now,
    messages: [
      {
        id: nanoid(),
        role: "user",
        content: "Any angry customers today?",
        createdAt: now
      },
      {
        id: nanoid(),
        role: "assistant",
        content: "Two threads need a reply.",
        createdAt: now,
        blocks: [
          {
            type: "error",
            title: "Linear automation paused",
            body: "OAuth token expired. Reconnect Linear to keep automations running."
          }
        ]
      }
    ],
    mcpData: {
      metrics: [
        { label: "High priority threads", value: "2", delta: "+1" },
        { label: "SLA breach risk", value: "1", delta: "-1" }
      ],
      churnRows: [
        ["Scale", "0.9%", "Watching"],
        ["Growth", "1.7%", "Critical"],
        ["Starter", "2.4%", "Stable"]
      ],
      anomalies: [
        {
          title: "Linear automation paused",
          body: "OAuth token expired. Reconnect to keep automations running."
        }
      ],
      workflows: [
        {
          id: "support-triage",
          title: "Support escalation",
          condition: "Auto-assign critical Linear issues",
          channel: "Linear + Slack",
          status: "Live"
        }
      ],
      eventStream: [
        { id: "evt-5", label: "Linear webhook retry scheduled", time: "3m ago" },
        { id: "evt-6", label: "Gmail digest refreshed", time: "10m ago" }
      ],
      dataSources: [
        { name: "Gmail", description: "Inbox threads", status: "Streaming" },
        { name: "Linear", description: "Issue automation", status: "OAuth expiring soon" },
        { name: "Slack", description: "Ops alerts", status: "Connected" }
      ]
    }
  }
];

export function inferTitleFromMessage(text: string) {
  return text.slice(0, 48) || "Untitled";
}
