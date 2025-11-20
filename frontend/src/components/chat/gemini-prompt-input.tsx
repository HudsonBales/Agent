"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Mic, Plus, Send } from "lucide-react";

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
    <div className="space-y-6">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.prompt}
              type="button"
              onClick={() => setMessage(suggestion.prompt)}
              className="flex min-w-[130px] flex-col items-center justify-center rounded-[2rem] border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 shadow-[0_8px_30px_rgba(32,33,36,0.08)] transition hover:shadow-[0_12px_40px_rgba(32,33,36,0.12)]"
            >
              <span>{suggestion.title}</span>
              <span className="text-neutral-500">{suggestion.subtitle}</span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 rounded-[36px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_30px_80px_rgba(32,33,36,0.12)] sm:flex-row sm:items-center sm:px-6">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
            aria-label="Add to prompt"
          >
            <Plus className="h-5 w-5" />
          </button>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Gemini"
            className="flex-1 resize-none border-none bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none sm:min-h-[1.5rem]"
            rows={1}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              Fast <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
              aria-label="Use microphone"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a73e8] text-white transition hover:bg-[#155ec2] disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
