import { Session, Agent } from "../types";
export interface PlanStep {
    id: string;
    title: string;
    description: string;
    dependsOn?: string[];
}
export interface PlanResult {
    goal: string;
    steps: PlanStep[];
}
export declare class PlannerAgent {
    private llm?;
    constructor(apiKey?: string | undefined);
    createPlan(session: Session, agent: Agent, latestUserMessage: string): Promise<PlanResult>;
    private buildFallbackPlan;
}
//# sourceMappingURL=planner-agent.d.ts.map