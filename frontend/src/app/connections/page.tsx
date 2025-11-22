import { AppShell } from "@/components/layout/app-shell";
import { listAgents, listSessions } from "@/lib/api";
import { listIntegrations } from "@/lib/integrations";
import { IntegrationGrid } from "@/components/connections/integration-grid";

interface Props {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function ConnectionsPage({ searchParams }: Props) {
  const [integrations, sessions, agents] = await Promise.all([listIntegrations(), listSessions(), listAgents()]);
  const status = typeof searchParams?.status === "string"
    ? {
        state: searchParams.status,
        integration: typeof searchParams.integration === "string" ? searchParams.integration : undefined,
        reason: typeof searchParams.reason === "string" ? searchParams.reason : undefined
      }
    : undefined;

  return (
    <AppShell sessions={sessions} agents={agents} integrations={integrations} hideOnboarding>
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-neutral-500">Instrument your stack</p>
          <h1 className="text-3xl font-semibold">Connections</h1>
          <p className="text-neutral-400">
            Every tool you connect becomes a live organ in the adaptive console. Stripe + Supabase + Slack + Notion in
            minutes.
          </p>
        </header>
        <IntegrationGrid integrations={integrations} status={status} />
      </div>
    </AppShell>
  );
}
