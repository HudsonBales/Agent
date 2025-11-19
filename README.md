# Indie Hacker Copilot

This repo now includes both the end-to-end product spec and a working full-stack implementation scaffold that mirrors the ChatGPT-style UX described in the spec.

## Apps & directories

| Path | Description |
| --- | --- |
| `docs/product_spec.md` | High-level product & architecture specification. |
| `frontend/` | Next.js 14 App Router project with Tailwind design system, mock backend, and key routes (`/chat`, `/agents`, `/connections`, `/settings`). |

## Frontend quick start

```bash
cd frontend
npm install
npm run dev
```

The app boots with a sidebar, streaming-style chat UI, connections dashboard, and editable agent gallery. Mock data lives in `src/data/mock.ts`; Next.js API routes simulate the orchestrator/connector responses.

## Testing & linting

Inside `frontend/`:

```bash
npm run lint
npm run typecheck
```

## Roadmap

* Swap the mock data layer in `src/lib/api.ts` with real Gateway/Orchestrator calls.
* Implement real streaming (SSE) handlers inside `app/api/chat/[sessionId]/stream`.
* Back the job scheduler & automations UI with a queue (e.g., Temporal, BullMQ).
