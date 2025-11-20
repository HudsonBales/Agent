# OpsPilot – Adaptive Operations OS Specification

## 0. Positioning Summary

OpsPilot is the first adaptive operations system — the “AI COO” that understands, visualizes, and runs a SaaS business automatically. It is not a dashboard builder, workflow tool, analytics suite, or automation platform. Instead, it is an agent-native OS where:

- The system auto-instruments Stripe + Supabase (or any MCP-capable source).
- Dashboards and admin panels generate themselves on demand.
- Signals stream in, anomalies are caught proactively, and incidents surface in context.
- Remediations + workflows are proposed, visualized, and executed automatically.
- The interface is a chat + adaptive canvas; the UI grows around the business, not the other way around.

Experience promise: “Chat on the left, living system on the right.”

## 1. Core Mental Model
- **Founder / Operator**: indie hacker or lean SaaS team who wants a single intelligent console.
- **Workspace**: scoped SaaS product instance; contains sessions, tools, signals, and adaptive layouts.
- **Session (Command Thread)**: chat between user and OpsPilot capturing prompts, plans, insights, workflows.
- **Adaptive Canvas Blocks**: generated UI schemas (metrics, incidents, workflows, logs) that materialize per session.
- **Agent Ensemble**: Planner, Ops Intelligence, UI Designer, Remediation — orchestrated via Apps SDK-style routes.
- **Workflow Run**: long-lived execution of remediation / automation tasks triggered by incidents or chat.
- **Signals Layer**: continuously ingested metrics, anomalies, and events that feed insights and incidents.
- **MCP Tooling**: Stripe, Supabase, Slack, Notion, etc. exposed as agent-callable tools with workspace context.

## 2. Frontend Architecture – Adaptive Command Console
### 2.1 Tech Stack
- **Framework**: Next.js (App Router) with React, TypeScript, and server components for shell hydration.
- **Styling**: Tailwind tokens + motion primitives (Framer Motion) to create cinematic panel transitions.
- **State**: Server data via async components + fetch, SSE streaming via Next route proxy, lightweight client state for composer/UI toggles.
- **Transport**: HTTPS for static requests, SSE for chat/tool events, optional WebSocket for future live telemetry replay.

### 2.2 Layout
- Left rail: sessions + agents + “Launch Command Console” CTA.
- Main area: **AI Command Console** (chat) + **Adaptive Canvas** (self-building panels).
- Additional routes: `/connections` (“Instrument your stack”), `/agents` (“Brain settings”), `/settings`.
- Canvas extends to contain incidents, workflows, live execution, insights — all generated, not user-configured.

### 2.3 Design System
- Palette: deep space background with neon highlights; subtle glassmorphism to imply holographic dashboards.
- Components emphasize “auto-generated” vibe: cards that fade in, diagrams that draw themselves, logs streaming with caret.
- Controls kept minimal; text + motion communicate state (“Auto-instrumenting…”, “Canvas listening…”).

### 2.4 Chat UX
- Chat is primary command surface; message bubbles capture user prompts + agent responses + structured blocks.
- SSE stream emits tokens + plan events + tool events + UI schema updates; UI renders each event in situ (plan cards, insight pills, workflow nodes).
- Composer encourages natural language: placeholder copy referencing “Connect Stripe, show MRR, fix payment failures”.
- Slash commands optional for quick actions (`/overview`, `/incident`, `/workflow`), but emphasis remains on natural chat.

## 3. Backend High-Level Design
### 3.1 Gateway API
Handles auth, workspace management, CRUD for sessions/messages/agents/connections/jobs, plus streaming chat endpoint proxying to orchestrator.
Example endpoints: `POST /api/sessions`, `GET /api/sessions/:id/messages`, `POST /api/chat/:sessionId/stream`, `POST /api/agents`, `GET /api/tools`, `POST /api/connections/:toolId/oauth/callback`, `POST /api/jobs`.

### 3.2 LLM Orchestrator
- Accepts `sessionId`, message history, active agent config, available tools.
- Builds prompts (system context + trimmed history) and calls LLM with tool-calling enabled.
- Emits event stream (`token_delta`, `tool_call_started`, `tool_call_finished`, `error`, `final_message`).
- For scheduled runs, same logic runs headless, persisting events for later review/notification.

## 4. MCP Connector Layer & Scheduler
### 4.1 MCP Client Service
- Registry of MCP servers and tools, manages encrypted credentials and per-tool configs.
- Provides `executeTool({ toolId, args, userContext })` to orchestrator.
- Flow: orchestrator requests tool execution → MCP client locates workspace connection → calls remote MCP server → returns JSON result.

### 4.2 Tool Surfacing in UI
- `/connections` lists tools, connection status, and CTA for OAuth/token entry.
- Agent editor allows selecting tools (controls whitelist) with icons/descriptions.

## 5. Agents & Automations
### 5.1 Agent Definition
- Fields: `name`, `description`, `systemPrompt`, `toolsWhitelist`, `defaultInputRole`, `triggers`.
- `/agents` page shows cards summarizing tool usage and last run; editing opens modal/new chat preselecting agent.

### 5.2 Automations / Scheduler
- Background scheduler monitors `jobs` table with cron expressions + `next_run_at`.
- When triggered, enqueues agent run with synthetic user prompt; orchestrator executes, capturing blocks.
- Delivery: append to session log, email, update Notion, etc. UI allows toggling schedules, editing cadence, viewing last run state.

## 6. Session & Message Storage
- **Sessions**: `id`, `workspaceId`, `title`, timestamps, `activeAgentId`, `model`, `archivedAt`.
- **Messages**: `id`, `sessionId`, `role` (user/assistant/tool/system), JSON `content` (to embed blocks), metadata (`toolName`, errors), timestamp.
- Blocks stored inside message JSON (preferred) for flexible rendering.

## 7. Polished UX Practices
- Fast initial render via Next.js server components + skeletons.
- Optimistic chat sending with pending assistant bubble.
- Smooth streaming (no flicker), sticky scroll with "New message" pill when off-bottom.
- Keyboard shortcuts: `Cmd/Ctrl+K` command palette, `Cmd+Shift+C` focus composer, `Esc` cancels response.
- Error blocks include actionable guidance (e.g., reconnect Stripe link).
- Micro-interactions: hover states, subtle motion, dark mode parity.

## 8. Example Flow
1. Founder selects "Daily Brief" agent; new chat session spins up.
2. Prompt sent via `/api/chat/:sessionId/stream`.
3. Orchestrator loads agent config + tools, calls Stripe & Gmail MCP servers, emitting events.
4. Frontend renders streaming summary, metric block, support ticket table.
5. User saves flow as automation (cron weekdays 9am).
6. Scheduler triggers run daily; orchestrator executes headless, emails summary and logs session.

This document should equip engineers to begin system design docs mirroring ChatGPT's polish while focusing on indie-hacker SaaS workflows.
