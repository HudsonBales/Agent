import { NextResponse } from "next/server";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:4000";
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? "ws-demo";

// Get integration catalog
export async function GET() {
  try {
    const url = new URL(`${API_BASE}/api/v1/integrations/catalog`);
    url.searchParams.set("workspaceId", WORKSPACE_ID);
    const response = await fetch(url, { cache: "no-store" });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch integration catalog:", errorText);
      return NextResponse.json({ error: "Failed to fetch integration catalog" }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching integration catalog:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Connect an integration
export async function POST(request: Request) {
  try {
    const { integrationId, credentials } = await request.json();
    
    const response = await fetch(`${API_BASE}/api/v1/integrations/${integrationId}/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credentials, workspaceId: WORKSPACE_ID }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to connect integration:", errorText);
      return NextResponse.json({ error: "Failed to connect integration" }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Disconnect an integration
export async function DELETE(request: Request) {
  try {
    const { integrationId } = await request.json();
    if (!integrationId) {
      return NextResponse.json({ error: "integrationId required" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/api/v1/integrations/${integrationId}/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workspaceId: WORKSPACE_ID }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to disconnect integration:", errorText);
      return NextResponse.json({ error: "Failed to disconnect integration" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
