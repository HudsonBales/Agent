import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";

export class NotionConnector implements IntegrationConnector {
  id = "notion";
  name = "Notion Docs";
  namespace = "notion";
  tools = [
    {
      id: "notion.create_page",
      name: "Create status page",
      description: "Creates a Notion page summarizing incidents.",
      args: { title: "Page title", content: "Markdown" }
    }
  ];

  async execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext) {
    if (toolId !== "notion.create_page") {
      throw new Error(`Unknown Notion tool: ${toolId}`);
    }
    return {
      pageId: `page-${Date.now()}`,
      title: args.title,
      status: "created",
      workspaceId: context.workspaceId
    };
  }
}
