import express from "express";
import { Buffer } from "node:buffer";
import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
import { IntegrationConnection } from "../data/models/integration.model";
import { OAUTH_PROVIDERS, getRedirectUri } from "../integrations/oauth-config";
import { oauthStateStore } from "../integrations/oauth-state";

interface IntegrationDeps {
  store: DataStore;
  gateway: MCPGateway;
}

export function createIntegrationRouter(deps: IntegrationDeps) {
  const router = express.Router();

  // Get integration catalog
  router.get("/catalog", async (req, res) => {
    const workspaceId = (req.query.workspaceId as string) ?? "ws-demo";
    const connections = deps.store.listIntegrationConnections(workspaceId);
    const tools = await deps.gateway.listTools();
    
    // Group tools by integration
    const integrations: Record<string, any> = {};
    
    tools.forEach(tool => {
      const namespace = tool.namespace;
      if (!integrations[namespace]) {
        integrations[namespace] = {
          id: namespace,
          name: getIntegrationName(namespace),
          description: getIntegrationDescription(namespace),
          category: getIntegrationCategory(namespace),
          logo: getIntegrationLogo(namespace),
          connected: isIntegrationConnected(namespace, connections),
          lastConnectedAt: getLastConnectedAt(namespace, connections),
          authType: getIntegrationAuthType(namespace),
          tools: []
        };
      }
      integrations[namespace].tools.push(tool);
    });
    
    res.json({ 
      data: Object.values(integrations)
    });
  });

  // Connect an integration via manual credentials/API keys
  router.post("/:integrationId/connect", (req, res) => {
    const { integrationId } = req.params;
    const { credentials, workspaceId = "ws-demo" } = req.body;
    if (!credentials) {
      return res.status(400).json({ error: "Credentials are required to connect an integration" });
    }
    
    const connection = deps.store.upsertIntegrationConnection(workspaceId, integrationId, {
      accessToken: credentials.accessToken ?? credentials.apiKey ?? "",
      refreshToken: credentials.refreshToken,
      expiresAt: credentials.expiresAt,
      connectionMetadata: {
        ...credentials.metadata,
        workspaceId
      }
    });
    
    res.json({ 
      data: { 
        success: true, 
        message: `${getIntegrationName(integrationId)} connected successfully`,
        connection 
      } 
    });
  });

  // Begin OAuth flow
  router.post("/:integrationId/oauth/start", (req, res) => {
    const { integrationId } = req.params;
    const provider = OAUTH_PROVIDERS[integrationId];
    if (!provider) {
      return res.status(404).json({ error: "OAuth not configured for this integration" });
    }
    const clientId = process.env[provider.clientIdEnv];
    if (!clientId) {
      return res.status(500).json({ error: `Missing ${provider.clientIdEnv}` });
    }
    const workspaceId = req.body?.workspaceId ?? "ws-demo";
    const state = oauthStateStore.create(integrationId, workspaceId);
    const redirectUri = getRedirectUri(integrationId);
    const authUrl = new URL(provider.authorizationUrl);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", provider.scopes.join(" "));
    authUrl.searchParams.set("state", state);
    Object.entries(provider.additionalAuthParams ?? {}).forEach(([key, value]) => {
      authUrl.searchParams.set(key, value);
    });
    res.json({ data: { url: authUrl.toString(), state } });
  });

  // OAuth callback handler
  router.get("/oauth/:integrationId/callback", async (req, res) => {
    const { integrationId } = req.params;
    const provider = OAUTH_PROVIDERS[integrationId];
    if (!provider) {
      return res.status(400).send("Unsupported integration");
    }
    const { state, code, error } = req.query as Record<string, string>;
    if (error) {
      return redirectToFrontend(res, integrationId, false, error);
    }
    if (!state || !code) {
      return res.status(400).send("Missing state or code");
    }
    const pending = oauthStateStore.consume(state);
    if (!pending || pending.integrationId !== integrationId) {
      return res.status(400).send("Invalid or expired state");
    }
    const clientId = process.env[provider.clientIdEnv];
    const clientSecret = process.env[provider.clientSecretEnv];
    if (!clientId || !clientSecret) {
      return res.status(500).send("OAuth credentials not configured");
    }
    try {
      const tokenPayload = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: getRedirectUri(integrationId)
      });
      if (!provider.useBasicAuth) {
        tokenPayload.set("client_id", clientId);
        tokenPayload.set("client_secret", clientSecret);
      }
      const tokenResponse = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: provider.useBasicAuth
          ? {
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded"
            }
          : { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenPayload
      });
      if (!tokenResponse.ok) {
        const text = await tokenResponse.text();
        console.error("OAuth token exchange failed", text);
        return redirectToFrontend(res, integrationId, false, "token_exchange_failed");
      }
      const data = await tokenResponse.json();
      const payload: Partial<IntegrationConnection> & { accessToken?: string } = {
        accessToken: data.access_token,
        connectionMetadata: {
          scope: data.scope,
          token_type: data.token_type
        }
      };
      if (data.refresh_token) {
        payload.refreshToken = data.refresh_token;
      }
      if (data.expires_in) {
        payload.expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }
      deps.store.upsertIntegrationConnection(pending.workspaceId, integrationId, payload);
      return redirectToFrontend(res, integrationId, true);
    } catch (err) {
      console.error("OAuth callback error", err);
      return redirectToFrontend(res, integrationId, false, "exception");
    }
  });

  // Disconnect an integration
  router.post("/:integrationId/disconnect", (req, res) => {
    const { integrationId } = req.params;
    const { workspaceId = "ws-demo" } = req.body;
    
    deps.store.disconnectIntegration(workspaceId, integrationId);
    
    res.json({ 
      data: { 
        success: true, 
        message: `${getIntegrationName(integrationId)} disconnected successfully` 
      } 
    });
  });

  // Get connection status
  router.get("/:integrationId/status", (req, res) => {
    const { integrationId } = req.params;
    const workspaceId = (req.query.workspaceId as string) ?? "ws-demo";
    const connection = deps.store.getIntegrationConnection(workspaceId, integrationId);
    const connected = Boolean(connection?.connected);
    
    res.json({ 
      data: { 
        connected,
        integration: integrationId,
        lastConnectedAt: connection?.updatedAt
      } 
    });
  });

  return router;
}

function getIntegrationName(namespace: string): string {
  const names: Record<string, string> = {
    stripe: "Stripe",
    supabase: "Supabase",
    slack: "Slack",
    notion: "Notion",
    github: "GitHub"
  };
  return names[namespace] || namespace;
}

function getIntegrationDescription(namespace: string): string {
  const descriptions: Record<string, string> = {
    stripe: "Payment processing and subscription management",
    supabase: "Database, authentication, and real-time subscriptions",
    slack: "Team communication and notifications",
    notion: "Documentation and knowledge management",
    github: "Code repository and issue management"
  };
  return descriptions[namespace] || `Integration for ${namespace}`;
}

function getIntegrationCategory(namespace: string): string {
  const categories: Record<string, string> = {
    stripe: "payments",
    supabase: "database",
    slack: "communication",
    notion: "documentation",
    github: "development"
  };
  return categories[namespace] || "other";
}

function getIntegrationLogo(namespace: string): string {
  // In a real implementation, this would return a URL to the integration's logo
  return `/logos/${namespace}.svg`;
}

function isIntegrationConnected(namespace: string, connections: IntegrationConnection[]): boolean {
  return connections.some((connection) => connection.integrationId === namespace && connection.connected);
}

function getLastConnectedAt(namespace: string, connections: IntegrationConnection[]): string | undefined {
  const connection = connections.find((conn) => conn.integrationId === namespace && conn.connected);
  return connection?.updatedAt;
}

function getIntegrationAuthType(namespace: string): "oauth" | "api_key" {
  return OAUTH_PROVIDERS[namespace] ? "oauth" : "api_key";
}

function redirectToFrontend(res: express.Response, integrationId: string, success: boolean, reason?: string) {
  const base = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";
  const url = new URL(`${base}/connections`);
  url.searchParams.set("integration", integrationId);
  url.searchParams.set("status", success ? "connected" : "error");
  if (reason) {
    url.searchParams.set("reason", reason);
  }
  res.redirect(url.toString());
}
