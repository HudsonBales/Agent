# OpsPilot – North Star Execution Plan

Grounded in the “Sam Altman leverage” mandate and the OpenAI design ethos, OpsPilot must feel like an always-on COO: the fastest way from a founder’s intent to measurable action. This plan codifies that target and breaks it into prioritized steps we can execute today.

## 1. Signature Loops (Jobs-To-Be-Done)

| Loop | Purpose | Input | Output |
| --- | --- | --- | --- |
| **Morning Brief** | Daily clarity. Merge revenue, retention, incidents, and queued automations into one streaming narrative. | “What changed overnight?” | Plan + adaptive widget stack + recommended plays. |
| **Incident Drill** | Rapid triage. Correlate anomalies with MCP data, propose remediations, and prep change windows. | “Payments just failed” | Timeline, tool calls, workflow toggles, comms kit. |
| **Revenue Experiment** | Iterate faster. Blend product analytics with billing data, suggest workflows or experiments, and schedule follow-ups. | “Test freemium gating” | Experiment plan, workflow scaffold, metrics to monitor. |

Every feature should either improve these loops or compress the time to complete them.

## 2. Experience Pillars (Head of Design priorities)

1. **Command Console + Adaptive Canvas** – Chat drives everything; widgets grow and animate organically as the LLM reasons. Emphasize plan assembly, live insights, and MCP tool chips.
2. **MCP-native Widgets** – Each tool call returns Apps SDK widgets with provenance (“Stripe metrics • 12s ago”). Widgets must be themable, interactive, and safe-area aware.
3. **Trust & Traceability** – Every streamed action gets a receipt: source, timestamp, actor, tool, and rollback guidance. Provide context chips and “Ask why” follow-ups.
4. **Ritual Launchers** – Quick actions for the three signature loops, preloaded with prompts + recommended agents. These should be accessible anywhere in the console.
5. **Cinematic Motion & Microcopy** – Use motion to show the system thinking (plan lines, widget bloom, workflow nodes pulsing). Copy reinforces autonomy (“Auto-instrumenting Stripe…”).

## 3. Technical Pillars (foundational work)

1. **MCP + Apps SDK parity** – Continue emitting `_meta.openai.outputTemplate` metadata for every tool call; expand to more tool families and ensure widget URLs stay versioned.
2. **Provenance Graph** – Record tool responses + metadata server-side so the UI can paint “insight timeline” and provide audit trails.
3. **Ritual API** – Lightweight endpoint to launch canonical prompts + workflows, tracking success metrics per ritual.
4. **Automation Mesh** – Represent workflows as cards in the canvas, showing status, dependencies, and policy toggles.
5. **Observability** – Instrument SSE + widget loads with latency + engagement metrics.

## 4. Implementation Roadmap (priority-ordered)

1. **P0 – Ritual launchers + nav refactor**
   - Add nav structure mapping to the mental model (Command Console, Instruments, Minds, Automations, Museum).
   - Provide ritual buttons that spin new sessions with prefilled prompts + agents.
2. **P1 – Provenance & Explainability**
   - Persist tool metadata; surface in UI as “source chips” and “ask why” prompts.
3. **P1 – Widget Library**
   - Expand `/apps/widgets/*` gallery; codify schema for metrics, tables, timeline blocks.
4. **P2 – Ritual API & Scheduler**
   - Backend endpoints for launching Morning Brief / Incident Drill, storing outcomes.
5. **P2 – Automation Mesh**
   - Visual workflow inspector + controls.

## 5. Immediate Sprint Backlog

| Priority | Work item | Owner | Status |
| --- | --- | --- | --- |
| P0 | Document north-star plan (this doc) | Core | ✅ |
| P0 | Update AppShell nav + rituals (Command Console nav + CTA buttons) | Frontend | ✅ |
| P1 | Attach provenance metadata to SSE events + UI chips | Backend + Frontend | ⏳ |
| P1 | Extend Apps SDK widget to handle timeline + incident data | Frontend | ⏳ |

## 6. Success Signals

- Time from prompt → insight < 5 seconds for cached data; < 12 seconds for live tool calls.
- 80% of sessions begin from a ritual launcher.
- Each assistant message includes at least one provenance chip/tool widget.
- Operators can audit (and trust) every decision with one click.

This plan should guide both near-term execution (refined nav, ritual launchers) and the medium-term arcs (provenance, automation mesh). We can now prioritize confidently and track progress against the loops that matter most.
