# Indie Hacker Copilot – Product Specification

## 1. Core Mental Model
- **User**: indie hacker operating one or more SaaS products.
- **Workspace / Product**: container for assets per SaaS; scopes sessions, agents, tools.
- **Session (Chat)**: threaded conversation akin to ChatGPT chats; stores messages + blocks.
- **Agent**: configurable GPT-like persona (name, description, system prompt, tool access, triggers).
- **Tool (MCP server)**: integrations (Stripe, Gmail, Notion, GitHub, etc.) surfaced through MCP protocol.
- **Run**: execution of an agent (foreground chat or scheduled background job).
- **Blocks**: structured UI payloads rendered within chats (tables, cards, metrics, error notices).

Everything rendered to the user is composed from sessions, blocks, agents, and tool executions.

## 2. Frontend Architecture (Next.js App Router)
### 2.1 Tech Stack
- **Framework**: Next.js (App Router) with React + TypeScript.
- **Styling**: Tailwind CSS driven by a token set (spacing, typography, radii, shadows, colors).
- **Component primitives**: Radix UI / shadcn-like layer for menus, dialogs, popovers, etc.
- **State / Data**: TanStack Query for server data and optimistic updates; lightweight Zustand store for ephemeral UI.
- **Transport**: HTTPS for standard requests, SSE/WebSocket for streaming chat tokens & tool events.

### 2.2 Layout
- Root layout with **left sidebar** (new chat button, recent sessions, agents, tools/connections, settings) and **main content** area.
- Routes: `/chat/[sessionId]`, `/agents`, `/connections`, `/settings`.
- Sidebar collapses responsively; session rows provide action menus (rename, duplicate, delete) with Framer Motion transitions.

### 2.3 Design System
- Neutral gray palette with accent CTAs, dark mode parity via CSS variables.
- Typography scale: `xs, sm, base, lg, xl, 2xl` using a single readable font.
- Spacing scale: `4/8/12/16px` multiples.
- Standardized components: buttons, inputs, selects, tabs, chips, toasts, avatars, skeletons, cards.
- Define tokens first, then build components to avoid per-page CSS hacks.

### 2.4 Chat UI
- Virtualized message list when long.
- Each message displays avatar, role, and Markdown-rendered content with syntax highlighting + copy button for code blocks.
- Tool outputs surface as typed blocks (tables, metric summaries, error blocks).
- Streaming via SSE/WebSocket yields `delta` token events and `tool_call_*` events; UI shows typing indicator, gradual reveal, "Thinking…" states for tools.
- Composer: multiline textarea, Enter to send, Shift+Enter newline, plus controls for agent picker, tool overrides, context attachments, and optional slash commands popover.

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
