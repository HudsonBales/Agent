import { AppShell } from "@/components/layout/app-shell";
import { listAgents, listSessions } from "@/lib/api";

export default async function AgentsPage() {
  const [agents, sessions] = await Promise.all([listAgents(), listSessions()]);

  return (
    <AppShell sessions={sessions} agents={agents}>
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-neutral-500">Build your copilots</p>
          <h1 className="text-3xl font-semibold">Agents</h1>
          <p className="text-neutral-400">Configure prompts, tools, and automations.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-2xl border border-white/5 bg-white/5 p-5">
              <p className="text-xs uppercase text-brand">{agent.trigger ? "Automated" : "On demand"}</p>
              <h2 className="mt-2 text-2xl font-semibold">{agent.name}</h2>
              <p className="text-sm text-neutral-300">{agent.description}</p>
              <div className="mt-4 text-xs text-neutral-400">Uses tools: {agent.tools.join(", ")}</div>
              {agent.trigger && (
                <p className="mt-2 rounded-full bg-black/40 px-3 py-1 text-xs text-neutral-200">Cron: {agent.trigger}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
