"use client";

import { Message } from "@/data/types";
import { MessageBubble } from "./message-bubble";
import { useSSE } from "@/lib/sse";
import { useEffect, useState } from "react";

export function MessageList({ messages, sessionId }: { messages: Message[]; sessionId: string }) {
  const { events } = useSSE(sessionId);
  const [streamedMessages, setStreamedMessages] = useState<Message[]>([]);

  // Process SSE events to update messages in real-time
  useEffect(() => {
    if (events.length === 0) return;

    const latestEvent = events[events.length - 1];
    
    // Handle different event types
    switch (latestEvent.type) {
      case "plan":
        // Add plan block to the last assistant message
        setStreamedMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            const updatedMsg = {
              ...lastMsg,
              blocks: [
                ...(lastMsg.blocks || []),
                {
                  type: "plan",
                  title: "Execution Plan",
                  data: latestEvent.data
                }
              ]
            };
            return [...prev.slice(0, -1), updatedMsg];
          }
          return prev;
        });
        break;
        
      case "insight":
        // Add insight as a new message
        const insightMessage: Message = {
          id: `insight-${Date.now()}`,
          role: "assistant",
          content: latestEvent.data.text || "New insight detected",
          createdAt: new Date().toISOString(),
          blocks: [
            {
              type: "metrics",
              metrics: [
                { label: "Insight", value: latestEvent.data.category || "General" }
              ]
            }
          ]
        };
        setStreamedMessages(prev => [...prev, insightMessage]);
        break;
        
      case "ui_schema":
        // Update UI schema block in the last assistant message
        setStreamedMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            const updatedMsg = {
              ...lastMsg,
              blocks: (lastMsg.blocks || []).map(block =>
                block.type === "ui_schema"
                  ? { ...block, data: latestEvent.data }
                  : block
              )
            };
            return [...prev.slice(0, -1), updatedMsg];
          }
          return prev;
        });
        break;
        
      case "tool_call":
        // Handle tool call events
        console.log("Tool call event:", latestEvent.data);
        break;
        
      case "final":
        // Final message update
        setStreamedMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            const updatedMsg = {
              ...lastMsg,
              content: latestEvent.data.message || lastMsg.content
            };
            return [...prev.slice(0, -1), updatedMsg];
          }
          return prev;
        });
        break;
    }
  }, [events]);

  // Combine original messages with streamed messages
  const allMessages = [...messages, ...streamedMessages].filter((message) => {
    return Boolean(message.content && message.content.trim().length > 0);
  });

  return (
    <div className="space-y-8">
      {allMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
