import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? "ws-demo";

export async function POST(request: Request) {
  const { sessionId, message } = await request.json();
  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId and message required" }, { status: 400 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/v1/chat/${sessionId}/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspaceId: WORKSPACE_ID,
      message,
      actorId: "web"
    })
  });

  if (!upstream.ok && upstream.status !== 307 && upstream.status !== 200) {
    const text = await upstream.text();
    return NextResponse.json({ error: text || "Backend error" }, { status: upstream.status });
  }

  if (!upstream.body) {
    return NextResponse.json({ error: "Backend stream unavailable" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");

  return new Response(upstream.body, {
    status: upstream.status,
    headers
  });
}
