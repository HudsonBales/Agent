"use client";

import { ReactNode, createContext, useCallback, useContext, useRef } from "react";

type ComposerAction = (value: string) => void;

interface ChatComposerValue {
  registerComposer: (fn: ComposerAction) => void;
  prefill: (value: string) => void;
}

const ChatComposerContext = createContext<ChatComposerValue | undefined>(undefined);

export function ChatComposerProvider({ children }: { children: ReactNode }) {
  const composerRef = useRef<ComposerAction | null>(null);

  const registerComposer = useCallback((fn: ComposerAction) => {
    composerRef.current = fn;
  }, []);

  const prefill = useCallback((value: string) => {
    composerRef.current?.(value);
  }, []);

  return (
    <ChatComposerContext.Provider value={{ registerComposer, prefill }}>{children}</ChatComposerContext.Provider>
  );
}

export function useChatComposer() {
  const context = useContext(ChatComposerContext);
  if (!context) {
    throw new Error("useChatComposer must be used within ChatComposerProvider");
  }
  return context;
}
