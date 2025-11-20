"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
class PlannerAgent {
    createPlan(session, agent, latestUserMessage) {
        const steps = [
            {
                id: "understand",
                title: "Understand request",
                description: `Clarify intent for "${latestUserMessage.slice(0, 80)}".`
            },
            {
                id: "gather-signals",
                title: "Gather key signals",
                description: "Load KPIs, anomalies, and workflow health.",
                dependsOn: ["understand"]
            },
            {
                id: "synthesize",
                title: "Synthesize response & UI",
                description: "Summarize insights and emit updated UI schema.",
                dependsOn: ["gather-signals"]
            }
        ];
        return {
            goal: `Help ${session.title}`,
            steps
        };
    }
}
exports.PlannerAgent = PlannerAgent;
//# sourceMappingURL=planner-agent.js.map