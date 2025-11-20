import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { MessageList } from "@/components/chat/message-list";
import { GeminiPromptInput } from "@/components/chat/gemini-prompt-input";
import { getSession, listAgents, listSessions } from "@/lib/api";

interface Props {
  params: { sessionId: string };
}

const quickSuggestions = [
  { title: "Help me", subtitle: "plan", prompt: "Plan a launch rollout for this quarter." },
  { title: "Save me", subtitle: "time", prompt: "Summarize the latest Stripe and Supabase KPIs." },
  { title: "Help me", subtitle: "write", prompt: "Draft a friendly update for our customer community." },
  { title: "Inspire", subtitle: "me", prompt: "Suggest bold product directions for OpsPilot." }
];

export default async function ChatPage({ params }: Props) {
  const [session, sessions, agents] = await Promise.all([getSession(params.sessionId), listSessions(), listAgents()]);

  if (!session) {
    notFound();
  }

  const hasMessages = session.messages.length > 0;

  return (
    <AppShell sessions={sessions} agents={agents}>
      <div className="flex flex-col items-center gap-3 pb-12 pt-16 text-center">
        <h1 className="text-4xl font-semibold leading-tight text-[#1f1f1f] sm:text-5xl">Meet Gemini, your personal AI assistant</h1>
        <p className="max-w-2xl text-base text-neutral-500">
          Ask something simple to get started.
        </p>
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-16">
        {!hasMessages ? null : <MessageList messages={session.messages} sessionId={session.id} />}
        <GeminiPromptInput sessionId={session.id} suggestions={quickSuggestions} />
        <p className="text-center text-xs text-neutral-500">
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">
            Google Terms
          </a>{" "}
          and the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">
            Google Privacy Policy
          </a>{" "}
          apply. Gemini can make mistakes, so double-check it.
        </p>
      </section>
    </AppShell>
  );
}
