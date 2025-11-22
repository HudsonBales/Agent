# OpsPilot Backend – Adaptive Ops Brain

The backend powers the “AI COO” experience described in `docs/product_spec.md`. It orchestrates the six subsystems (edge/API, orchestration, integrations, automation, signals, experience) so the console can understand, visualize, and improve a SaaS business automatically.

## Running locally

```bash
npm install
npm run dev            # tsx watch mode
# or
npm run build && npm start
```

The service listens on `http://localhost:4000` by default. Configure the port with `PORT=5000 npm run dev`.

## Subsystems

- **Edge / API layer** – `src/api/router.ts` exposes `/api/v1/*` plus the SSE chat stream. It terminates connections and forwards every prompt/tool call downstream.
- **Agent orchestration** – `src/agents/*` (planner, ops intelligence, UI designer, remediation) and `AgentOrchestrator` maintain conversation state, emit streaming events, and coordinate planning/insight/remediation across tools.
- **Integration / MCP gateway** – `src/integrations/mcp-gateway.ts` plus `connectors/*` simulate MCP servers (Stripe, Supabase, Slack, Notion) to demonstrate tool discovery/invocation under per-workspace context.
- **OpenAI Apps Bridge** – tool executions now emit `_meta.openai.outputTemplate` metadata (via `src/apps/apps-sdk.ts`) so ChatGPT renders the OpsPilot widget next to generative replies when MCP servers stream interactive blocks.
- **Automation & workflow engine** – `src/workflows/engine.ts` executes graph definitions, tracks runs, and emits completion signals; it is the live execution mode visualized in the adaptive canvas.
- **Signals & intelligence** – `src/signals/signals-service.ts` ingests synthetic telemetry, computes metrics, and detects anomalies, driving the proactive incident panels in the UI.
- **Experience & UI schema layer** – `src/experience/ui-experience-service.ts` generates dashboard layouts + panels so the frontend can render the “self-building console” without manual composition.

All subsystems share a JSON-backed `DataStore` seeded by `src/data/seed.ts` and persisted to `backend/.data/db.json`. Delete that file to reseed or replace the store with a database-backed implementation when ready.

## Key endpoints

| Route | Description |
| --- | --- |
| `GET /health` | Service health probe. |
| `GET /api/v1/workspaces/:workspaceId/sessions` | List chat sessions for a workspace. |
| `POST /api/v1/workspaces/:workspaceId/sessions` | Create a new session and seed it with a user message. |
| `GET /api/v1/sessions/:sessionId/messages` | Fetch ordered conversation history. |
| `POST /api/v1/chat/:sessionId/stream` | Start a streaming agent response (SSE) for a new user message. |
| `GET /api/v1/workspaces/:workspaceId/agents` | List configured agents. |
| `POST /api/v1/workspaces/:workspaceId/agents` | Create/update an agent definition. |
| `GET /api/v1/workspaces/:workspaceId/tools` | List MCP tools available to the workspace. |
| `GET /api/v1/workspaces/:workspaceId/signals/metrics` | Return computed metric series. |
| `GET /api/v1/workspaces/:workspaceId/signals/anomalies` | List detected anomalies. |
| `GET /api/v1/workspaces/:workspaceId/ui/:context` | Fetch the latest UI schema for a given context (e.g., `main_dashboard`). |
| `POST /api/v1/workspaces/:workspaceId/ui/:context/regenerate` | Force regeneration of a schema through the UI designer agent. |
| `GET /api/v1/workspaces/:workspaceId/workflows` | List workflow definitions. |
| `GET /api/v1/workspaces/:workspaceId/workflows/runs` | Inspect workflow run history. |
| `POST /api/v1/workflows/:workflowId/run` | Execute a workflow immediately with the automation engine. |
| `GET /api/v1/workspaces/:workspaceId/overview` | Convenience bundle of sessions, agents, signals, and UI layout. |

## Extending the backend

- Swap JSON persistence with Postgres/Redis + auth for real workspaces, then wire migrations into `src/server.ts`.
- Replace the simulated MCP connectors with actual integrations (Stripe, Supabase, Linear, Slack, Notion).
- Plug real LLM calls (OpenAI, Anthropic, Gemini, Bedrock) into `AgentOrchestrator` to reason over plans/UI/workflows.
- Expand the workflow engine with branching, retries, policy-based auto-remediation, and multi-worker execution.
- Feed real telemetry via webhooks/streams into `SignalsService` for production-grade anomaly/insight detection.

### Apps SDK configuration

The Apps bridge uses `FRONTEND_BASE_URL` (or `APPS_WIDGET_BASE_URL` if set) to point ChatGPT at the widget bundle served from the frontend (`/apps/widgets/mcp-dashboard`). Update those environment variables when deploying to ensure the `_meta.openai.outputTemplate` metadata resolves to a publicly accessible URL.
