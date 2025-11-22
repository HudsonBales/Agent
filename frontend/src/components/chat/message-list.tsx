"use client";

import { Message } from "@/data/types";
import { MessageBubble } from "./message-bubble";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChatStream } from "./chat-stream-context";

interface Props {
  messages: Message[];
}

export function MessageList({ messages }: Props) {
  const { events, connected } = useChatStream();
  const [streamedMessages, setStreamedMessages] = useState<Message[]>([]);
  const processedRef = useRef(0);

  useEffect(() => {
    if (events.length === 0 || processedRef.current === events.length) {
      return;
    }
    const newEvents = events.slice(processedRef.current);
    processedRef.current = events.length;

    newEvents.forEach((event) => {
      switch (event.type) {
        case "plan":
          setStreamedMessages((prev) => {
            const next = [...prev];
            const assistantMsg = next[next.length - 1];
            if (assistantMsg && assistantMsg.role === "assistant") {
              const updated = {
                ...assistantMsg,
                blocks: [
                  ...(assistantMsg.blocks ?? []),
                  {
                    type: "plan",
                    title: "Execution plan",
                    data: event.data
                  }
                ]
              } as Message;
              next.splice(next.length - 1, 1, updated);
              return next;
            }
            return [
              ...prev,
              {
                id: `plan-${Date.now()}`,
                role: "assistant",
                content: "Here is the current plan.",
                createdAt: new Date().toISOString(),
                blocks: [
                  {
                    type: "plan",
                    title: "Execution plan",
                    data: event.data
                  }
                ]
              }
            ];
          });
          break;
        case "insight":
          setStreamedMessages((prev) => [
            ...prev,
            {
              id: `insight-${Date.now()}`,
              role: "assistant",
              content: event.data.text ?? "New insight detected.",
              createdAt: new Date().toISOString(),
              blocks: [
                {
                  type: "metrics",
                  metrics: [
                    {
                      label: event.data.category ?? "Insight",
                      value: event.data.score ?? "Live"
                    }
                  ]
                }
              ]
            }
          ]);
          break;
        case "ui_schema":
          setStreamedMessages((prev) => {
            const next = [...prev];
            const existing = next[next.length - 1];
            if (existing && existing.role === "assistant") {
              const updated = {
                ...existing,
                blocks: [
                  ...(existing.blocks ?? []).filter((block) => block.type !== "ui_schema"),
                  {
                    type: "ui_schema",
                    title: "Adaptive layout",
                    data: event.data
                  }
                ]
              } as Message;
              next.splice(next.length - 1, 1, updated);
              return next;
            }
            return [
              ...prev,
              {
                id: `schema-${Date.now()}`,
                role: "assistant",
                content: "Updating the canvas with a new layout.",
                createdAt: new Date().toISOString(),
                blocks: [
                  {
                    type: "ui_schema",
                    title: "Adaptive layout",
                    data: event.data
                  }
                ]
              }
            ];
          });
          break;
        case "final":
          setStreamedMessages((prev) => {
            const next = [...prev];
            const existing = next[next.length - 1];
            if (existing && existing.role === "assistant") {
              next.splice(next.length - 1, 1, {
                ...existing,
                content: event.data.message ?? existing.content
              });
              return next;
            }
            return prev;
          });
          break;
        default:
          break;
      }
    });
  }, [events]);

  const mergedMessages = useMemo(() => {
    return [...messages, ...streamedMessages].filter((message) => message.content?.trim().length);
  }, [messages, streamedMessages]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/50">
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-yellow-400"}`} />
        {connected ? "Live" : "Reconnecting"}
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {mergedMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
