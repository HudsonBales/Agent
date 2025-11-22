"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { connectIntegration } from "@/lib/integrations";

interface Props {
  onSuccess?: () => void;
  compact?: boolean;
}

export function SupabaseConnectForm({ onSuccess, compact }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [functionName, setFunctionName] = useState("sync_subscription");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const urlId = useId();
  const keyId = useId();
  const functionId = useId();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!url || !serviceKey) {
      setError("Project URL and service role key are required");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await connectIntegration("supabase", {
        accessToken: serviceKey,
        metadata: {
          supabaseUrl: url,
          syncFunction: functionName || undefined
        }
      });
      setSuccess(true);
      setServiceKey("");
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-white">
      <div className="space-y-1">
        <label htmlFor={urlId} className="text-xs uppercase tracking-[0.3em] text-white/50">Supabase project URL</label>
        <input
          id={urlId}
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://abccompany.supabase.co"
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={keyId} className="text-xs uppercase tracking-[0.3em] text-white/50">Service role key</label>
        <input
          id={keyId}
          type="password"
          required
          value={serviceKey}
          onChange={(event) => setServiceKey(event.target.value)}
          placeholder="supabase service role key"
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
        <p className="text-xs text-white/40">Stored securely per workspace. Required for Admin API access.</p>
      </div>
      <div className="space-y-1">
        <label htmlFor={functionId} className="text-xs uppercase tracking-[0.3em] text-white/50">Sync function (optional)</label>
        <input
          id={functionId}
          type="text"
          value={functionName}
          onChange={(event) => setFunctionName(event.target.value)}
          placeholder="sync_subscription"
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
        <p className="text-xs text-white/40">Used when Ops workflows trigger Supabase Edge Functions.</p>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-300">Supabase connected. Refreshing…</p> : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-400/80 to-blue-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {pending ? "Connecting…" : "Connect Supabase"}
        </button>
      </div>
    </form>
  );
}
