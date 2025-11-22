export interface OAuthProviderConfig {
  id: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  useBasicAuth?: boolean;
  additionalAuthParams?: Record<string, string>;
}

const BASE_REDIRECT_PATH = "/api/v1/integrations/oauth";

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  slack: {
    id: "slack",
    authorizationUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    scopes: ["chat:write", "channels:read", "users:read"],
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
    additionalAuthParams: { user_scope: "channels:history" }
  },
  notion: {
    id: "notion",
    authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: ["read", "write"],
    clientIdEnv: "NOTION_CLIENT_ID",
    clientSecretEnv: "NOTION_CLIENT_SECRET"
  },
  github: {
    id: "github",
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["repo", "issues", "workflow"],
    clientIdEnv: "GITHUB_CLIENT_ID",
    clientSecretEnv: "GITHUB_CLIENT_SECRET"
  },
  stripe: {
    id: "stripe",
    authorizationUrl: "https://connect.stripe.com/oauth/authorize",
    tokenUrl: "https://connect.stripe.com/oauth/token",
    scopes: ["read_only"],
    clientIdEnv: "STRIPE_CONNECT_CLIENT_ID",
    clientSecretEnv: "STRIPE_CONNECT_CLIENT_SECRET"
  }
};

export function getRedirectUri(providerId: string) {
  const base = process.env.BACKEND_BASE_URL ?? "http://localhost:4000";
  return `${base}${BASE_REDIRECT_PATH}/${providerId}/callback`;
}
