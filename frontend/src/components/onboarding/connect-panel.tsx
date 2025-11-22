"use client";

import { useEffect, useState } from "react";
import type { Integration } from "@/lib/integrations";
import { SupabaseConnectForm } from "@/components/connections/supabase-connect-form";
import Link from "next/link";

interface Props {
  integrations?: Integration[];
}

const STORAGE_KEY = "ops_onboarding_skip";

export function OnboardingConnectPanel({ integrations }: Props) {
  const [integrationState, setIntegrationState] = useState<Integration[] | undefined>(integrations);
  const [loading, setLoading] = useState(!integrations);
  const supabase = integrationState?.find((integration) => integration.id === "supabase");
  const needsSupabase = supabase ? !supabase.connected : false;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIntegrationState(integrations);
    setLoading(!integrations);
  }, [integrations]);

  useEffect(() => {
    if (integrations || typeof window === "undefined") {
      return;
    }
    let cancelled = false;
    const fetchIntegrations = async () => {
      try {
        const response = await fetch("/api/integrations", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        if (!cancelled) {
          setIntegrationState(payload.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch integrations", error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchIntegrations();
    return () => {
      cancelled = true;
    };
  }, [integrations]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (supabase?.connected) {
      setDismissed(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "1");
      }
    }
  }, [supabase?.connected]);

  if ((!needsSupabase && !loading) || dismissed) {
    return null;
  }

  function skip() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-10">
      <div className="relative max-w-4xl rounded-[40px] border border-white/10 bg-[#05060f] p-10 text-white shadow-[0_40px_160px_rgba(0,0,0,0.65)]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-white/50">Step 2 · Instrument your stack</p>
          <h2 className="text-3xl font-semibold">Connect Supabase to unlock live product telemetry</h2>
          <p className="text-white/70">
            Just like Linear’s onboarding, we start by wiring your core data sources. Supabase powers activation metrics,
            anomaly detection, and automated remediation workflows.
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold">Why connect Supabase?</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>• Stream live activation and retention metrics into the adaptive canvas.</li>
              <li>• Allow agents to run Supabase Edge Functions from the chat.</li>
              <li>• Keep Stripe + Supabase data in sync for subscription workflows.</li>
            </ul>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Connect in under a minute.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
            {loading ? (
              <div className="flex h-full items-center justify-center text-white/60">Loading…</div>
            ) : (
              <SupabaseConnectForm onSuccess={() => setDismissed(true)} />
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-white/60">Need help? <Link href="/connections" className="underline">See all integrations</Link></div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={skip}
              className="rounded-full border border-white/20 px-4 py-2 text-white/70 transition hover:border-white/40"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
