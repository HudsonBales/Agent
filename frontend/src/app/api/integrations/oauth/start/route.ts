import { NextResponse } from "next/server";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:4000";
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? "ws-demo";

export async function POST(request: Request) {
  try {
    const { integrationId } = await request.json();
    if (!integrationId) {
      return NextResponse.json({ error: "integrationId required" }, { status: 400 });
    }
    const response = await fetch(`${API_BASE}/api/v1/integrations/${integrationId}/oauth/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ workspaceId: WORKSPACE_ID })
    });
    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text || "Failed to start OAuth" }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OAuth start failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
