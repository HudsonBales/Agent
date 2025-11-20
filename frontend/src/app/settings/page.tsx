import { AppShell } from "@/components/layout/app-shell";
import { listAgents, listSessions } from "@/lib/api";

export default async function SettingsPage() {
  const [agents, sessions] = await Promise.all([listAgents(), listSessions()]);

  return (
    <AppShell sessions={sessions} agents={agents}>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-neutral-500">Workspace DNA</p>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-neutral-400">
            Control the identity OpsPilot uses when talking to your SaaS — workspace metadata, billing ownership,
            default agents.
          </p>
        </header>
        <div className="space-y-4">
          <section className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <h2 className="text-xl font-semibold">Workspace</h2>
            <p className="text-sm text-neutral-400">Indie Founders LLC</p>
          </section>
          <section className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <h2 className="text-xl font-semibold">Billing</h2>
            <p className="text-sm text-neutral-400">Usage will appear here once Stripe is connected.</p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
