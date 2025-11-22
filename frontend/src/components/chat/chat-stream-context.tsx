"use client";

import { ReactNode, createContext, useContext } from "react";
import { SSEEvent, useSSE } from "@/lib/sse";

interface ChatStreamValue {
  events: SSEEvent[];
  connected: boolean;
  clearEvents: () => void;
}

const ChatStreamContext = createContext<ChatStreamValue | undefined>(undefined);

export function ChatStreamProvider({ sessionId, children }: { sessionId: string; children: ReactNode }) {
  const { events, connected, clearEvents } = useSSE(sessionId);
  return (
    <ChatStreamContext.Provider value={{ events, connected, clearEvents }}>{children}</ChatStreamContext.Provider>
  );
}

export function useChatStream() {
  const context = useContext(ChatStreamContext);
  if (!context) {
    throw new Error("useChatStream must be used within ChatStreamProvider");
  }
  return context;
}
