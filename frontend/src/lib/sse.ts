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
    if (!sessionId) return;

    // Clear previous events when session changes
    setEvents([]);

    const eventSource = new EventSource(`/api/messages/stream/${sessionId}`);
    eventSourceRef.current = eventSource;
    setConnected(true);

    eventSource.onmessage = (event) => {
      try {
        const sseEvent: SSEEvent = {
          type: event.lastEventId || "message",
          data: JSON.parse(event.data)
        };
        setEvents(prev => [...prev, sseEvent]);
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error", error);
      setConnected(false);
    };

    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, [sessionId]);

  return { events, connected, clearEvents: () => setEvents([]) };
}