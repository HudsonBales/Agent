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

export class PlannerAgent {
  createPlan(session: Session, agent: Agent, latestUserMessage: string): PlanResult {
    const steps: PlanStep[] = [
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
