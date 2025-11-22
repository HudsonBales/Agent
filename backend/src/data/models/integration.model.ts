export interface IntegrationConnection {
  id: string;
  workspaceId: string;
  integrationId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  connected: boolean;
  connectionMetadata?: Record<string, unknown>;
}

export interface IntegrationToken {
  id: string;
  connectionId: string;
  token: string;
  tokenType: string; // 'access' | 'refresh'
  expiresAt?: string;
  createdAt: string;
  revokedAt?: string;
}
