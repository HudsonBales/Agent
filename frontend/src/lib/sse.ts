import { useEffect, useRef, useState } from "react";

export interface SSEEvent {
  type: string;
  data: any;
}

export function useSSE(sessionId: string) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    setEvents([]);

    const eventSource = new EventSource(`/api/messages/stream/${sessionId}`);
    eventSourceRef.current = eventSource;

    const listeners: Array<{ type: string; handler: (event: MessageEvent) => void }> = [];
    const registerListener = (eventType: string) => {
      const handler = (event: MessageEvent) => {
        try {
          const payload = event.data ? JSON.parse(event.data) : null;
          setEvents((prev) => [...prev, { type: eventType, data: payload }]);
        } catch (error) {
          console.error("Error parsing SSE data", error);
        }
      };
      eventSource.addEventListener(eventType, handler as EventListener);
      listeners.push({ type: eventType, handler });
    };

    ["message", "plan", "insight", "ui_schema", "tool_call", "final", "workflow", "anomaly", "ui_update", "error"].forEach(
      (eventType) => registerListener(eventType)
    );

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = (error) => {
      console.error("SSE error", error);
      setConnected(false);
    };

    return () => {
      listeners.forEach(({ type, handler }) => {
        eventSource.removeEventListener(type, handler as EventListener);
      });
      eventSource.close();
      setConnected(false);
    };
  }, [sessionId]);

  return { events, connected, clearEvents: () => setEvents([]) };
}
