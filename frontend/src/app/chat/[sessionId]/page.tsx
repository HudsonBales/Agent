import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { MessageList } from "@/components/chat/message-list";
import { GeminiPromptInput } from "@/components/chat/gemini-prompt-input";
import { getSession, listAgents, listSessions } from "@/lib/api";
import { ChatStreamProvider } from "@/components/chat/chat-stream-context";
import { ChatComposerProvider } from "@/components/chat/chat-composer-context";
import { AdaptiveCanvas } from "@/components/canvas/adaptive-canvas";
import { listIntegrations } from "@/lib/integrations";

interface Props {
  params: { sessionId: string };
}

const quickSuggestions = [
  { title: "Plan", subtitle: "Launch readiness", prompt: "Plan our launch readiness by combining Stripe + Supabase risk." },
  { title: "Explain", subtitle: "Churn spike", prompt: "Explain why churn ticked up yesterday and draft a fix." },
  { title: "Automate", subtitle: "Billing issue", prompt: "Set up a workflow that retries failed invoices and pings billing." }
];

export default async function ChatPage({ params }: Props) {
  const [session, sessions, agents, integrations] = await Promise.all([
    getSession(params.sessionId),
    listSessions(),
    listAgents(),
    listIntegrations()
  ]);

  if (!session) {
    notFound();
  }

  return (
    <AppShell sessions={sessions} agents={agents} activeSessionId={session.id} integrations={integrations}>
      <ChatStreamProvider sessionId={session.id}>
        <ChatComposerProvider>
          <div className="flex h-full flex-col gap-6 xl:flex-row">
            <section className="flex flex-1 flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(2,4,9,0.8)]">
              <div className="flex flex-col gap-6 overflow-hidden">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Conversational Ops Brain</p>
                  <h2 className="text-3xl font-semibold text-white">Ask, observe, remediate.</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageList messages={session.messages} />
                </div>
              </div>
              <div className="pt-4">
                <GeminiPromptInput sessionId={session.id} suggestions={quickSuggestions} />
              </div>
            </section>
            <section className="w-full shrink-0 xl:w-[420px]">
              <AdaptiveCanvas session={session} />
            </section>
          </div>
        </ChatComposerProvider>
      </ChatStreamProvider>
    </AppShell>
  );
}
