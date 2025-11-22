import type { Tool } from "@/data/types";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  connected: boolean;
  lastConnectedAt?: string;
  authType?: "oauth" | "api_key";
  tools: Tool[];
}

type ApiEnvelope<T> = { data: T };

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
const WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID ?? "ws-demo";

export async function listIntegrations(): Promise<Integration[]> {
  try {
    const isServer = typeof window === "undefined";

    if (isServer) {
      const url = new URL(`${BACKEND_URL}/api/v1/integrations/catalog`);
      url.searchParams.set("workspaceId", WORKSPACE_ID);
      const backendResponse = await fetch(url, { cache: "no-store" });
      if (!backendResponse.ok) {
        const text = await backendResponse.text();
        throw new Error(`Backend ${backendResponse.status} for integrations: ${text}`);
      }
      const backendPayload = (await backendResponse.json()) as ApiEnvelope<Integration[]>;
      return backendPayload.data;
    }

    const response = await fetch(`/api/integrations`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status} for integrations: ${text}`);
    }
    
    const payload = (await response.json()) as ApiEnvelope<Integration[]>;
    return payload.data;
  } catch (error) {
    console.error("Fetch failed for integrations:", error);
    throw new Error("Failed to fetch integrations. Please check if the backend server is running.");
  }
}

export async function connectIntegration(integrationId: string, credentials: any): Promise<boolean> {
  try {
    const response = await fetch("/api/integrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ integrationId, credentials }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status} for connecting integration: ${text}`);
    }
    
    const payload = (await response.json()) as ApiEnvelope<{ success: boolean }>;
    return payload.data.success;
  } catch (error) {
    console.error(`Failed to connect integration ${integrationId}:`, error);
    throw new Error(`Failed to connect integration ${integrationId}. Please try again.`);
  }
}

export async function disconnectIntegration(integrationId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/integrations", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ integrationId }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status} for disconnecting integration: ${text}`);
    }

    const payload = (await response.json()) as ApiEnvelope<{ success: boolean }>;
    return payload.data.success;
  } catch (error) {
    console.error(`Failed to disconnect integration ${integrationId}:`, error);
    throw new Error(`Failed to disconnect integration ${integrationId}. Please try again.`);
  }
}
