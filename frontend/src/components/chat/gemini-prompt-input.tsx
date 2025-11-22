"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Send, Sparkles, Wand2 } from "lucide-react";
import { useChatComposer } from "./chat-composer-context";

interface Suggestion {
  title: string;
  subtitle: string;
  prompt: string;
}

interface GeminiPromptInputProps {
  sessionId: string;
  suggestions?: Suggestion[];
}

export function GeminiPromptInput({ sessionId, suggestions = [] }: GeminiPromptInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { registerComposer } = useChatComposer();

  useEffect(() => {
    registerComposer((value) => setMessage(value));
  }, [registerComposer]);

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

  const disabled = !message.trim() || sending;

  return (
    <div className="space-y-4">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.prompt}
              type="button"
              onClick={() => setMessage(suggestion.prompt)}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10"
            >
              <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">{suggestion.title}</span>
              <span className="text-sm text-white">{suggestion.subtitle}</span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_100px_rgba(5,6,20,0.6)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/50">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>Ask anything about your ops graph</span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Summarize Stripe + Supabase anomalies, design a fix, explain it like a PM."
            className="flex-1 resize-none bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
            rows={3}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60 transition hover:border-white/30"
              >
                <Wand2 className="h-3 w-3" />
                Automate
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/40"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/40">Shift + Enter for newline</span>
              <button
                type="submit"
                disabled={disabled}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white transition hover:scale-105 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
