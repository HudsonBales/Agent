import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
import { ChatStreamEvent, MessageBlock } from "../types";
import { OpsIntelligenceAgent } from "./ops-intelligence-agent";
import { PlannerAgent } from "./planner-agent";
import { RemediationAgent } from "./remediation-agent";
import { UIDesignerAgent } from "./ui-designer-agent";

interface OrchestratorRequest {
  workspaceId: string;
  sessionId: string;
  message: string;
  actorId: string;
}

export class AgentOrchestrator {
  constructor(
    private store: DataStore,
    private planner: PlannerAgent,
    private ops: OpsIntelligenceAgent,
    private uiDesigner: UIDesignerAgent,
    private remediation: RemediationAgent,
    private gateway: MCPGateway
  ) {}

  async *runChat(request: OrchestratorRequest): AsyncGenerator<ChatStreamEvent> {
    const session = this.store.getSession(request.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    const agent = this.store.getAgent(session.activeAgentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    this.store.appendMessage(request.sessionId, {
      sessionId: request.sessionId,
      role: "user",
      content: request.message,
      createdAt: new Date().toISOString()
    });

    const plan = await this.planner.createPlan(session, agent, request.message);
    yield { type: "plan", data: plan };

    const insights = await this.ops.generateInsights(request.workspaceId);
    for (const insight of insights) {
      yield { type: "insight", data: insight };
    }

    const toolCalls = agent.toolsWhitelist.slice(0, 2);
    for (const toolId of toolCalls) {
      yield { type: "tool_call", data: { toolId, status: "started" } };
      try {
        const execution = await this.gateway.execute(
          { workspaceId: request.workspaceId, actorId: request.actorId },
          toolId,
          { range: "7d" }
        );
        yield {
          type: "tool_call",
          data: {
            toolId,
            status: "finished",
            result: execution.result,
            metadata: execution.metadata
          }
        };
      } catch (error) {
        yield {
          type: "tool_call",
          data: { toolId, status: "error", error: (error as Error).message }
        };
      }
    }

    const schema = await this.uiDesigner.design(request.workspaceId, "main_dashboard");
    yield { type: "ui_schema", data: schema };

    const remediationSuggestions = await this.remediation.suggest(request.workspaceId, this.store.listAnomalies(request.workspaceId));

    const summary = [
      `**Plan**: ${plan.goal}`,
      `**Insights**: ${insights.slice(0, 2).map((insight) => insight.text).join(" • ") || "No new insights"}`,
      `**Next**: ${remediationSuggestions.map((suggestion) => suggestion.title).join(", ") || "Monitor metrics."}`
    ].join("\n");

    const blocks: MessageBlock[] = [
      {
        type: "plan",
        title: "Plan",
        data: plan
      },
      {
        type: "ui_schema",
        title: "Updated Layout",
        data: schema.layout
      }
    ];

    this.store.appendMessage(request.sessionId, {
      sessionId: request.sessionId,
      role: "assistant",
      content: summary,
      blocks,
      createdAt: new Date().toISOString(),
      metadata: {
        remediationSuggestions
      }
    });

    yield { type: "final", data: { message: summary } };
  }
}
