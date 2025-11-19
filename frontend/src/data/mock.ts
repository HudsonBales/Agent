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
    ]
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
    ]
  }
];

export function inferTitleFromMessage(text: string) {
  return text.slice(0, 48) || "Untitled";
}
