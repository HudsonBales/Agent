import { AppShell } from "@/components/layout/app-shell";
import { listAgents, listSessions, listTools } from "@/lib/api";

export default async function ConnectionsPage() {
  const [tools, sessions, agents] = await Promise.all([listTools(), listSessions(), listAgents()]);

  return (
    <AppShell sessions={sessions} agents={agents}>
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-neutral-500">Wire everything up</p>
          <h1 className="text-3xl font-semibold">Connections</h1>
          <p className="text-neutral-400">OAuth-style handshakes simplified for indie hackers.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">{tool.name}</p>
                  <p className="text-sm text-neutral-400">{tool.description}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    tool.connected ? "bg-emerald-500/20 text-emerald-200" : "bg-yellow-500/20 text-yellow-200"
                  }`}
                >
                  {tool.connected ? "Connected" : "Connect"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
