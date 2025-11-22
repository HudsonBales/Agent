import { OpenAIAppsWidgetTemplate, ToolExecutionMetadata } from "../types";

const DEFAULT_FRONTEND_BASE = process.env.APPS_WIDGET_BASE_URL ?? process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";

export interface AppsWidgetState extends Record<string, unknown> {
  workspaceId: string;
  toolId: string;
  actorId: string;
  source: "connector" | "mcp";
  payload: unknown;
  generatedAt: string;
}

interface WidgetOptions {
  workspaceId: string;
  actorId: string;
  toolId: string;
  payload: unknown;
  source: "connector" | "mcp";
}

const DEFAULT_WIDGET_ID = "opspilot.apps.mcp-dashboard";
const DEFAULT_WIDGET_DESCRIPTION =
  "Interactive dashboard that visualizes tool output returned from OpsPilot MCP connections.";

export function createAppsWidgetMetadata(options: WidgetOptions): ToolExecutionMetadata | undefined {
  if (!shouldHydrateWidget(options.toolId)) {
    return undefined;
  }

  const widgetUrl = buildWidgetUrl();
  const state: AppsWidgetState = {
    workspaceId: options.workspaceId,
    toolId: options.toolId,
    actorId: options.actorId,
    source: options.source,
    payload: options.payload,
    generatedAt: new Date().toISOString()
  };

  return {
    openai: {
      outputTemplate: {
        id: DEFAULT_WIDGET_ID,
        version: "1.0.0",
        title: "OpsPilot MCP Dashboard",
        description: DEFAULT_WIDGET_DESCRIPTION,
        kind: "openai.apps.widget",
        url: widgetUrl,
        height: 520,
        state: state as Record<string, unknown>
      }
    }
  };
}

function buildWidgetUrl(): string {
  try {
    const url = new URL("/apps/widgets/mcp-dashboard", DEFAULT_FRONTEND_BASE);
    return url.toString();
  } catch {
    return `${DEFAULT_FRONTEND_BASE}/apps/widgets/mcp-dashboard`;
  }
}

const TOOL_PREFIXES_WITH_WIDGETS = ["stripe.", "supabase.", "slack.", "notion.", "github.", "ops.", "mcp."];

function shouldHydrateWidget(toolId: string): boolean {
  return TOOL_PREFIXES_WITH_WIDGETS.some((prefix) => toolId.startsWith(prefix));
}
