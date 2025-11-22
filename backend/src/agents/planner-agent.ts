import { Session, Agent } from "../types";
import { LLMService } from "../core/llm-service";

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
  private llm?: LLMService;

  constructor(apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey) {
      console.warn("OPENAI_API_KEY not set. PlannerAgent will use fallback heuristics.");
      return;
    }
    this.llm = new LLMService(apiKey);
  }

  async createPlan(session: Session, agent: Agent, latestUserMessage: string): Promise<PlanResult> {
    // For simple cases, use the existing logic
    if (latestUserMessage.toLowerCase().includes("hello") || latestUserMessage.toLowerCase().includes("hi")) {
      const steps: PlanStep[] = [
        {
          id: "greet",
          title: "Greet user",
          description: "Respond to greeting"
        },
        {
          id: "offer-help",
          title: "Offer assistance",
          description: "Ask how you can help",
          dependsOn: ["greet"]
        }
      ];
      return {
        goal: "Greet the user",
        steps
      };
    }

    // For complex requests, use LLM
    const systemPrompt = `You are an AI planning assistant for an operations intelligence platform. 
    Your job is to create a structured plan to address user requests.
    
    The user is working in a SaaS operations environment with access to:
    - Stripe integration for payment/subscription data
    - Supabase integration for product analytics
    - Signal detection for anomaly monitoring
    - Workflow automation capabilities
    
    Create a concise plan with 2-4 steps that logically sequence actions to fulfill the request.`;

    const prompt = `Create a plan for this request: "${latestUserMessage}"
    
    Current session context:
    - Session title: ${session.title}
    - Active agent: ${agent.name}
    - Agent description: ${agent.description}
    
    Respond in JSON format with:
    {
      "goal": "brief description of the overall goal",
      "steps": [
        {
          "id": "unique-step-id",
          "title": "human-readable step title",
          "description": "detailed description of what this step accomplishes"
        }
      ]
    }`;

    if (!this.llm) {
      return this.buildFallbackPlan(session, latestUserMessage);
    }

    try {
      const result = await this.llm.generateStructuredOutput<PlanResult>(prompt, systemPrompt);
      return result;
    } catch (error) {
      console.error("LLM planning failed, using fallback:", error);
      return this.buildFallbackPlan(session, latestUserMessage);
    }
  }

  private buildFallbackPlan(session: Session, latestUserMessage: string): PlanResult {
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
