interface PendingState {
  integrationId: string;
  workspaceId: string;
  createdAt: number;
}

const STATE_TTL_MS = 5 * 60 * 1000;

export class OAuthStateStore {
  private states = new Map<string, PendingState>();

  create(integrationId: string, workspaceId: string) {
    const state = crypto.randomUUID();
    this.states.set(state, { integrationId, workspaceId, createdAt: Date.now() });
    this.evictExpired();
    return state;
  }

  consume(state: string) {
    const pending = this.states.get(state);
    if (pending) {
      this.states.delete(state);
    }
    return pending;
  }

  private evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.states.entries()) {
      if (now - entry.createdAt > STATE_TTL_MS) {
        this.states.delete(key);
      }
    }
  }
}

export const oauthStateStore = new OAuthStateStore();
