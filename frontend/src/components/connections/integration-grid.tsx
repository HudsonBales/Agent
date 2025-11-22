"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Integration } from "@/lib/integrations";
import { connectIntegration, disconnectIntegration } from "@/lib/integrations";
import { SupabaseConnectForm } from "./supabase-connect-form";

interface Props {
  integrations: Integration[];
  status?: { integration?: string; state?: string; reason?: string };
}

function buildBanner(status?: { integration?: string; state?: string; reason?: string }) {
  if (!status) return null;
  if (status.state === "connected" && status.integration) {
    return `${status.integration} connected successfully`;
  }
  if (status.state === "error") {
    return status.integration ? `${status.integration} connection failed` : "Integration connection failed";
  }
  return null;
}

export function IntegrationGrid({ integrations, status }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(() => buildBanner(status));

  useEffect(() => {
    setBanner(buildBanner(status));
  }, [status]);

  async function handleConnect(integration: Integration) {
    setError(null);
    if (integration.authType === "oauth") {
      await startOAuthFlow(integration);
      return;
    }

    if (integration.id === "supabase") {
      setError("Use the Supabase form to connect this integration.");
      return;
    }

    let credentials: Record<string, unknown> | null = {};

    if (integration.id === "stripe") {
      const apiKey = window.prompt("Enter your Stripe secret key");
      if (!apiKey) {
        return;
      }
      credentials = { apiKey };
    } else {
      const token = window.prompt(`Provide credentials for ${integration.name}`);
      if (!token) {
        return;
      }
      credentials = { accessToken: token };
    }

    setPendingId(integration.id);
    try {
      await connectIntegration(integration.id, credentials);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDisconnect(integration: Integration) {
    setError(null);
    if (!window.confirm(`Disconnect ${integration.name}?`)) {
      return;
    }
    setPendingId(integration.id);
    try {
      await disconnectIntegration(integration.id);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  async function startOAuthFlow(integration: Integration) {
    setPendingId(integration.id);
    try {
      const response = await fetch("/api/integrations/oauth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId: integration.id })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to start OAuth");
      }
      const payload = await response.json();
      const url = payload?.data?.url;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {banner ? (
        <div className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-100">
          {banner}
        </div>
      ) : null}
      {error ? <p className="text-sm text-accent-red">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const actionPending = pendingId === integration.id;
          const connectLabel = integration.authType === "oauth" ? "Connect via OAuth" : "Connect";
          return (
            <div key={integration.id} className="rounded-lg border border-neutral-700 bg-neutral-800 p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">{integration.name}</p>
                  <p className="text-sm text-neutral-400">{integration.description}</p>
                  {integration.lastConnectedAt ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Last connected {new Date(integration.lastConnectedAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    integration.connected ? "bg-accent-green/20 text-accent-green" : "bg-accent-yellow/20 text-accent-yellow"
                  }`}
                >
                  {integration.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="mt-4">
                {integration.connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(integration)}
                    disabled={actionPending}
                    className="rounded-full bg-accent-red/20 px-4 py-2 text-sm text-accent-red transition hover:bg-accent-red/30 disabled:opacity-50"
                  >
                    {action-pending ? "Disconnecting…" : "Disconnect"}
                  </button>
                ) : integration.id === "supabase" ? (
                  <SupabaseConnectForm onSuccess={() => router.refresh()} />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnect(integration)}
                    disabled={actionPending}
                    className="rounded-full bg-brand px-4 py-2 text-sm text-brand-foreground transition hover:bg-brand/90 disabled:opacity-50"
                  >
                    {actionPending ? "Connecting…" : connectLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
