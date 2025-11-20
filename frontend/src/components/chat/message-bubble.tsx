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
          isAssistant ? "bg-[#e8f0fe] text-[#1a73e8]" : "bg-[#1a73e8] text-white"
        )}
      >
        {role?.[0] ?? "?"}
      </div>
      <div
        className={clsx(
          "flex-1 space-y-3 rounded-3xl border px-5 py-4 text-sm shadow-sm",
          isAssistant ? "border-neutral-200 bg-[#f8f9fb] text-neutral-900" : "border-transparent bg-[#1a73e8] text-white"
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-between text-[10px] uppercase tracking-[0.4em]",
            isAssistant ? "text-neutral-400" : "text-white/70"
          )}
        >
          <span>{role}</span>
          <span>{formattedTime}</span>
        </div>
        <div className={clsx("max-w-none leading-relaxed", isAssistant ? "text-neutral-900" : "text-white/90")}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {message.blocks && message.blocks.length > 0 && (
          <div className={clsx("space-y-3 text-sm", isAssistant ? "text-neutral-600" : "text-white/90")}>
            <BlocksRenderer blocks={message.blocks} />
          </div>
        )}
      </div>
    </div>
  );
}
