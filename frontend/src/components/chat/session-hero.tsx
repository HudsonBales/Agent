import { Agent, Session, Tool } from "@/data/types";

interface Props {
  agent?: Agent;
  session: Session;
  tools: Tool[];
}

const heroHighlights = [
  { label: "Modes", value: "Chat · Build · Ship" },
  { label: "Canvas status", value: "Listening live" },
  { label: "Gemini", value: "2.5 Pro" }
];

export function SessionHero({ agent, session, tools }: Props) {
  const connectedTools = tools.filter((tool) => (agent?.tools ?? []).includes(tool.id));

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-[#101733] via-[#050615] to-[#02030c] p-8 shadow-[0_45px_140px_rgba(3,6,20,0.85)]">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle,_rgba(108,133,255,0.25),_transparent_65%)] blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.6em] text-neutral-400">AI Studio · OpsPilot</p>
          <h1 className="text-4xl font-semibold text-white">Gemini Canvas for {session.title}</h1>
          <p className="text-sm text-neutral-300">
            {agent?.description ?? "OpsPilot analyzes, visualizes, and remediates your SaaS automatically."} Built with
            the same UX language as <span className="font-semibold text-white">aistudio.google.com/apps</span>.
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] text-neutral-400">
            <span className="rounded-full border border-white/10 px-3 py-1">Agent · {agent?.name ?? "OpsPilot"}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Tools · {connectedTools.length}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              Updated{" "}
              {new Date(session.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-neutral-200">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Workspace snapshot</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {heroHighlights.map((highlight) => (
              <div key={highlight.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">{highlight.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{highlight.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Connected tools</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/80">
              {connectedTools.length > 0
                ? connectedTools.map((tool) => (
                    <span key={tool.id} className="rounded-full border border-white/10 px-3 py-1">
                      {tool.name}
                    </span>
                  ))
                : "Connect Stripe, Supabase, Slack…"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
