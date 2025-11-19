import { Agent, Session, Tool } from "@/data/mock";

interface Props {
  agent?: Agent;
  session: Session;
  tools: Tool[];
}

export function SessionHero({ agent, session, tools }: Props) {
  const connectedTools = tools.filter((tool) => (agent?.tools ?? []).includes(tool.id));

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-black/60 p-6 shadow-card backdrop-blur">
      <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Live COO Console</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">{agent?.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">{agent?.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
            Auto-instrumenting data
          </span>
          <span className="rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-brand">
            {connectedTools.length} tools online
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
            Session · {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Connected Stack</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {connectedTools.map((tool) => (
              <span key={tool.id} className="rounded-lg bg-black/40 px-3 py-1 text-sm text-white/80">
                {tool.name}
              </span>
            ))}
            {connectedTools.length === 0 && (
              <p className="text-sm text-neutral-500">No MCP tools added yet.</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/0 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Next action</p>
          <p className="mt-3 text-lg font-semibold text-white">Awaiting instruction</p>
          <p className="text-sm text-neutral-400">Use chat to steer dashboards and workflows.</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/0 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">Generative state</p>
          <p className="mt-3 text-lg font-semibold text-white">Canvas listening</p>
          <p className="text-sm text-neutral-400">Right-side console blooms with every agent step.</p>
        </div>
      </div>
    </section>
  );
}
