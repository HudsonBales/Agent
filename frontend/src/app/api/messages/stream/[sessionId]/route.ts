import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? "ws-demo";

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  
  if (!sessionId) {
    return new NextResponse("Session ID required", { status: 400 });
  }

  try {
    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        // Connect to backend SSE endpoint
        const backendUrl = `${BACKEND_URL}/api/v1/chat/${sessionId}/stream`;
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: WORKSPACE_ID,
            message: "", // Empty message for streaming existing events
            actorId: "web"
          })
        });

        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    return new NextResponse("Stream error", { status: 500 });
  }
}