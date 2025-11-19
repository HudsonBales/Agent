import { AppShell } from "@/components/layout/app-shell";
import { MessageList } from "@/components/chat/message-list";
import { ChatComposer } from "@/components/chat/chat-composer";
import { getSession, listAgents, listSessions } from "@/lib/api";
import { notFound } from "next/navigation";

interface Props {
  params: { sessionId: string };
}

export default async function ChatPage({ params }: Props) {
  const [session, sessions, agents] = await Promise.all([
    getSession(params.sessionId),
    listSessions(),
    listAgents()
  ]);

  if (!session) {
    notFound();
  }

  return (
    <AppShell sessions={sessions} agents={agents}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="space-y-2 border-b border-white/5 pb-6">
          <p className="text-sm uppercase tracking-wide text-neutral-400">Active agent</p>
          <h1 className="text-3xl font-semibold text-white">
            {agents.find((agent) => agent.id === session.activeAgentId)?.name}
          </h1>
          <p className="text-neutral-400">
            {agents.find((agent) => agent.id === session.activeAgentId)?.description}
          </p>
        </div>
        <MessageList messages={session.messages} />
        <ChatComposer sessionId={session.id} />
      </div>
    </AppShell>
  );
}
