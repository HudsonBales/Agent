import { Message } from "@/data/mock";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";

const roleCopy = {
  user: "You",
  assistant: "Indie Copilot",
  tool: "Tool",
  system: "System"
};

export function MessageBubble({ message }: { message: Message }) {
  const role = roleCopy[message.role];
  const isAssistant = message.role === "assistant";

  return (
    <div className={clsx("flex gap-3", isAssistant ? "flex-row" : "flex-row-reverse")}> 
      <div className="h-10 w-10 rounded-full bg-white/10 text-center text-sm leading-10 text-white">
        {role?.[0] ?? "?"}
      </div>
      <div className="flex-1 space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm shadow-card">
        <p className="text-xs uppercase tracking-wide text-neutral-400">{role}</p>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.blocks && message.blocks.length > 0 && <BlocksRenderer blocks={message.blocks} />}
      </div>
    </div>
  );
}
