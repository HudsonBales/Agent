"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ComposerProps {
  sessionId: string;
}

export function ChatComposer({ sessionId }: ComposerProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask anything about your SaaS..."
        className="w-full resize-none rounded-xl bg-transparent text-sm text-white outline-none"
        rows={3}
      />
      <div className="mt-3 flex items-center justify-between text-sm text-neutral-400">
        <p>Enter ↵ to send • Shift+Enter for newline</p>
        <Button type="submit" loading={sending} disabled={!message.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}
