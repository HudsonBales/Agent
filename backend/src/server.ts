import path from "node:path";
import { createApp } from "./api/router";
import { PlannerAgent } from "./agents/planner-agent";
import { AgentOrchestrator } from "./agents/orchestrator";
import { OpsIntelligenceAgent } from "./agents/ops-intelligence-agent";
import { RemediationAgent } from "./agents/remediation-agent";
import { UIDesignerAgent } from "./agents/ui-designer-agent";
import { EventBus } from "./core/event-bus";
import { DataStore } from "./data/store";
import { seedData } from "./data/seed";
import { UIExperienceService } from "./experience/ui-experience-service";
import { MCPGateway } from "./integrations/mcp-gateway";
import { SignalsService } from "./signals/signals-service";
import { WorkflowEngine } from "./workflows/engine";

export function buildServer() {
  const bus = new EventBus();
  const dataDir = path.join(process.cwd(), ".data");
  const persistPath = path.join(dataDir, "db.json");
  const store = new DataStore(seedData, { persistPath });
  const gateway = new MCPGateway(store);
  const signals = new SignalsService(store, bus);
  const uiService = new UIExperienceService(store, bus);
  const workflows = new WorkflowEngine(store, gateway, bus);
  const planner = new PlannerAgent();
  const ops = new OpsIntelligenceAgent(signals);
  const remediation = new RemediationAgent(workflows);
  const uiDesigner = new UIDesignerAgent(uiService);
  const orchestrator = new AgentOrchestrator(store, planner, ops, uiDesigner, remediation, gateway);

  const app = createApp({ store, orchestrator, gateway, signals, workflows, ui: uiService, bus });

  signals.start();
  workflows.start();

  bus.on("signals.anomaly.detected", (payload) => {
    console.log("[Signals] anomaly detected", payload);
  });
  bus.on("workflow.run.completed", (payload) => {
    console.log("[Workflow] run completed", payload);
  });
  bus.on("ui.schema.generated", (payload) => {
    console.log("[UI] schema generated", payload);
  });

  return app;
}
