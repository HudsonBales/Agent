import { Message } from "@/data/types";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";

const roleCopy = {
  user: "You",
  assistant: "Gemini",
  tool: "Tool",
  system: "System"
};

export function MessageBubble({ message }: { message: Message }) {
  const role = roleCopy[message.role];
  const isAssistant = message.role === "assistant";
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={clsx("flex gap-4", isAssistant ? "flex-row" : "flex-row-reverse")}> 
      <div
        className={clsx(
          "h-10 w-10 rounded-2xl text-center text-sm font-semibold leading-[2.5rem]",
          isAssistant ? "bg-white/10 text-white" : "bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white"
        )}
      >
        {role?.[0] ?? "?"}
      </div>
      <div
        className={clsx(
          "flex-1 space-y-3 rounded-3xl border px-5 py-4 text-sm shadow-xl",
          isAssistant
            ? "border-white/5 bg-white/5 text-white"
            : "border-[#2563eb]/40 bg-gradient-to-br from-[#1d3b74] to-[#0f1c42] text-white"
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-between text-[10px] uppercase tracking-[0.4em]",
            isAssistant ? "text-white/60" : "text-white/70"
          )}
        >
          <span>{role}</span>
          <span>{formattedTime}</span>
        </div>
        <div className="prose prose-invert max-w-none text-base leading-relaxed">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.blocks && message.blocks.length > 0 && (
          <div className="space-y-3 text-sm text-white/90">
            <BlocksRenderer blocks={message.blocks} />
          </div>
        )}
      </div>
    </div>
  );
}
