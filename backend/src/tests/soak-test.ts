import { DataStore } from "../data/store";
import { seedData } from "../data/seed";
import { EventBus } from "../core/event-bus";
import { SignalsService } from "../signals/signals-service";
import { WorkflowEngine } from "../workflows/engine";
import { MCPGateway } from "../integrations/mcp-gateway";
import { PlannerAgent } from "../agents/planner-agent";
import { OpsIntelligenceAgent } from "../agents/ops-intelligence-agent";
import { UIDesignerAgent } from "../agents/ui-designer-agent";
import { UIExperienceService } from "../experience/ui-experience-service";
import { RemediationAgent } from "../agents/remediation-agent";
import { AgentOrchestrator } from "../agents/orchestrator";

async function runSoakTest(iterations: number, workspaceId: string) {
  const bus = new EventBus();
  const store = new DataStore(seedData);
  const gateway = new MCPGateway(store);
  const signals = new SignalsService(store, bus);
  const ui = new UIExperienceService(store, bus);
  const workflows = new WorkflowEngine(store, gateway, bus);
  const planner = new PlannerAgent();
  const ops = new OpsIntelligenceAgent(signals);
  const remediation = new RemediationAgent(workflows);
  const uiDesigner = new UIDesignerAgent(ui);
  const orchestrator = new AgentOrchestrator(store, planner, ops, uiDesigner, remediation, gateway);

  signals.start();
  workflows.start();

  const agents = store.listAgents(workspaceId);
  const primaryAgent = agents[0];
  if (!primaryAgent) {
    throw new Error(`No agents configured for workspace ${workspaceId}`);
  }

  const baselineSession = store.listSessions(workspaceId)[0] ?? store.createSession(workspaceId, {
    title: "Soak Harness",
    activeAgentId: primaryAgent.id,
    message: "Bootstrapping session for soak test"
  });

  const stats = {
    plan: 0,
    insight: 0,
    ui: 0,
    finals: 0,
    toolErrors: 0
  };

  for (let i = 0; i < iterations; i += 1) {
    console.log(`[soak] iteration ${i + 1}/${iterations}`);
    const stream = orchestrator.runChat({
      workspaceId,
      sessionId: baselineSession.id,
      message: `Soak iteration ${i + 1} ping`,
      actorId: "soak-test"
    });
    for await (const event of stream) {
      if (event.type === "plan") stats.plan += 1;
      if (event.type === "insight") stats.insight += 1;
      if (event.type === "ui_schema") stats.ui += 1;
      if (event.type === "final") stats.finals += 1;
      if (event.type === "tool_call" && (event.data as any)?.status === "error") stats.toolErrors += 1;
    }
  }

  console.log(`[soak] completed ${iterations} runs`, stats);
}

(async () => {
  const iterations = Number(process.env.SOAK_ITERATIONS ?? 5);
  const workspaceId = process.env.SOAK_WORKSPACE_ID ?? "ws-demo";

  try {
    await runSoakTest(iterations, workspaceId);
    process.exit(0);
  } catch (error) {
    console.error("[soak] failed", error);
    process.exit(1);
  }
})();
