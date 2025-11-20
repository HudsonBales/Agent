"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSSE } from "@/lib/sse";

interface ComposerProps {
  sessionId: string;
}

export function ChatComposer({ sessionId }: ComposerProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { events, connected } = useSSE(sessionId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSending(true);
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message })
      });
      setMessage("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="rounded-2xl border border-white/10 bg-white p-4 text-neutral-900">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.4em] text-neutral-500">
          <span>Gemini Studio prompt</span>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-[9px] font-semibold text-neutral-600">
            {connected ? "Live" : "Standby"}
          </span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Guide OpsPilot to triage incidents, surface insights, or deploy automations..."
          className="mt-3 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
          rows={3}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-500">
          <p>Shift+Enter · Enter ↵ to send</p>
          <Button
            type="submit"
            loading={sending}
            disabled={!message.trim()}
            className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-black"
          >
            Send
          </Button>
        </div>
      </div>
      {connected && (
        <div className="text-xs text-emerald-300">
          Streaming updates on — keep the Studio loop tight.
        </div>
      )}
    </form>
  );
}
