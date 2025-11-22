import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";

interface SupabaseUser {
  id: string;
  email?: string;
  created_at?: string;
  app_metadata?: Record<string, unknown>;
}

interface SupabaseUserResponse {
  users: SupabaseUser[];
}

export class SupabaseConnector implements IntegrationConnector {
  id = "supabase";
  name = "Supabase";
  namespace = "supabase";
  requiresConnection = true;
  tools = [
    {
      id: "supabase.analytics",
      name: "Query activation metrics",
      description: "Uses the Supabase Admin API to return signup metrics.",
      args: { metric: "conversion_rate|activation_rate", range: "7d|30d" }
    },
    {
      id: "supabase.sync_subscription",
      name: "Retry subscription sync",
      description: "Invokes a Supabase Function to re-sync subscription data.",
      args: { retries: "Number of retries" }
    }
  ];

  async execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext) {
    const config = this.getConfig(context);

    if (toolId === "supabase.analytics") {
      const range = (args.range as string) ?? "7d";
      const since = new Date(Date.now() - this.getRangeDays(range) * 86_400_000).toISOString();
      const response = await this.fetchSupabase<SupabaseUserResponse | { users: SupabaseUser[] }>(
        config.url,
        config.apiKey,
        `/auth/v1/admin/users?per_page=1000`
      );

      const users = Array.isArray((response as SupabaseUserResponse).users)
        ? (response as SupabaseUserResponse).users
        : Array.isArray(response)
          ? (response as SupabaseUser[])
          : [];

      const newUsers = users.filter((user) => user.created_at && user.created_at >= since);

      return {
        workspaceId: context.workspaceId,
        range,
        totalUsers: users.length,
        newUsers: newUsers.length,
        activationRate: Number(((newUsers.length / Math.max(users.length, 1)) * 100).toFixed(2)),
        sampleUsers: newUsers.slice(0, 5).map((user) => ({
          id: user.id,
          email: user.email,
          createdAt: user.created_at
        }))
      };
    }

    if (toolId === "supabase.sync_subscription") {
      const retries = Number(args.retries ?? 1);
      const functionName = config.syncFunction ?? "sync_subscription";
      const response = await this.invokeFunction(config.url, config.apiKey, functionName, {
        workspaceId: context.workspaceId,
        actorId: context.actorId,
        retries
      });
      return {
        status: "queued",
        functionName,
        retries,
        response
      };
    }

    throw new Error(`Unknown Supabase tool: ${toolId}`);
  }

  private getConfig(context: IntegrationContext) {
    const metadata = (context.connection?.connectionMetadata || {}) as Record<string, unknown>;
    const url = (metadata.supabaseUrl as string) ?? process.env.SUPABASE_URL;
    const apiKey = context.connection?.accessToken ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    const syncFunction = (metadata.syncFunction as string) ?? process.env.SUPABASE_SYNC_FUNCTION;
    if (!url || !apiKey) {
      throw new Error("Supabase URL or service role key missing. Connect Supabase first.");
    }
    return { url, apiKey, syncFunction };
  }

  private getRangeDays(range: string) {
    return range === "30d" ? 30 : 7;
  }

  private async fetchSupabase<T>(url: string, apiKey: string, path: string): Promise<T> {
    const endpoint = `${url}${path.startsWith("/") ? path : `/${path}`}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase API ${response.status}: ${errorText}`);
    }
    return (await response.json()) as T;
  }

  private async invokeFunction(url: string, apiKey: string, name: string, payload: Record<string, unknown>) {
    const endpoint = `${url}/functions/v1/${name}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase function ${name} failed: ${errorText}`);
    }
    return response.status === 204 ? { message: "Function invoked" } : await response.json();
  }
}
