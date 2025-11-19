import { AppShell } from "@/components/layout/app-shell";
import { MessageList } from "@/components/chat/message-list";
import { ChatComposer } from "@/components/chat/chat-composer";
import { SessionHero } from "@/components/chat/session-hero";
import { GenerativeConsole } from "@/components/canvas/generative-console";
import { getSession, listAgents, listSessions, listTools } from "@/lib/api";
import { notFound } from "next/navigation";

interface Props {
  params: { sessionId: string };
}

export default async function ChatPage({ params }: Props) {
  const [session, sessions, agents, tools] = await Promise.all([
    getSession(params.sessionId),
    listSessions(),
    listAgents(),
    listTools()
  ]);

  if (!session) {
    notFound();
  }

  const activeAgent = agents.find((agent) => agent.id === session.activeAgentId);

  return (
    <AppShell sessions={sessions} agents={agents}>
      <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
        <SessionHero agent={activeAgent} session={session} tools={tools} />
        <div className="flex flex-col gap-6 lg:flex-row">
          <section className="flex w-full flex-col gap-4 lg:w-[55%]">
            <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-black/50 p-5 shadow-card">
              <div className="space-y-8">
                <MessageList messages={session.messages} />
              </div>
              <ChatComposer sessionId={session.id} />
            </div>
          </section>
          <section className="w-full lg:w-[45%]">
            <GenerativeConsole session={session} agent={activeAgent} tools={tools} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
