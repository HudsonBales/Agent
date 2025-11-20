"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
class AgentOrchestrator {
    constructor(store, planner, ops, uiDesigner, remediation, gateway) {
        this.store = store;
        this.planner = planner;
        this.ops = ops;
        this.uiDesigner = uiDesigner;
        this.remediation = remediation;
        this.gateway = gateway;
    }
    async *runChat(request) {
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
        const plan = this.planner.createPlan(session, agent, request.message);
        yield { type: "plan", data: plan };
        const insights = this.ops.generateInsights(request.workspaceId);
        for (const insight of insights) {
            yield { type: "insight", data: insight };
        }
        const toolCalls = agent.toolsWhitelist.slice(0, 2);
        for (const toolId of toolCalls) {
            yield { type: "tool_call", data: { toolId, status: "started" } };
            const result = await this.gateway.execute({ workspaceId: request.workspaceId, actorId: request.actorId }, toolId, { range: "7d" });
            yield { type: "tool_call", data: { toolId, status: "finished", result } };
        }
        const schema = await this.uiDesigner.design(request.workspaceId, "main_dashboard");
        yield { type: "ui_schema", data: schema };
        const remediationSuggestions = this.remediation.suggest(request.workspaceId, this.store.listAnomalies(request.workspaceId));
        const summary = [
            `**Plan**: ${plan.goal}`,
            `**Insights**: ${insights.slice(0, 2).map((insight) => insight.text).join(" • ") || "No new insights"}`,
            `**Next**: ${remediationSuggestions.map((suggestion) => suggestion.title).join(", ") || "Monitor metrics."}`
        ].join("\n");
        const blocks = [
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
exports.AgentOrchestrator = AgentOrchestrator;
//# sourceMappingURL=orchestrator.js.map