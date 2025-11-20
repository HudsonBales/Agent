"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
const node_path_1 = __importDefault(require("node:path"));
const router_1 = require("./api/router");
const planner_agent_1 = require("./agents/planner-agent");
const orchestrator_1 = require("./agents/orchestrator");
const ops_intelligence_agent_1 = require("./agents/ops-intelligence-agent");
const remediation_agent_1 = require("./agents/remediation-agent");
const ui_designer_agent_1 = require("./agents/ui-designer-agent");
const event_bus_1 = require("./core/event-bus");
const store_1 = require("./data/store");
const seed_1 = require("./data/seed");
const ui_experience_service_1 = require("./experience/ui-experience-service");
const mcp_gateway_1 = require("./integrations/mcp-gateway");
const signals_service_1 = require("./signals/signals-service");
const engine_1 = require("./workflows/engine");
function buildServer() {
    const bus = new event_bus_1.EventBus();
    const dataDir = node_path_1.default.join(process.cwd(), ".data");
    const persistPath = node_path_1.default.join(dataDir, "db.json");
    const store = new store_1.DataStore(seed_1.seedData, { persistPath });
    const gateway = new mcp_gateway_1.MCPGateway();
    const signals = new signals_service_1.SignalsService(store, bus);
    const uiService = new ui_experience_service_1.UIExperienceService(store, bus);
    const workflows = new engine_1.WorkflowEngine(store, gateway, bus);
    const planner = new planner_agent_1.PlannerAgent();
    const ops = new ops_intelligence_agent_1.OpsIntelligenceAgent(signals);
    const remediation = new remediation_agent_1.RemediationAgent(workflows);
    const uiDesigner = new ui_designer_agent_1.UIDesignerAgent(uiService);
    const orchestrator = new orchestrator_1.AgentOrchestrator(store, planner, ops, uiDesigner, remediation, gateway);
    const app = (0, router_1.createApp)({ store, orchestrator, gateway, signals, workflows, ui: uiService });
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
//# sourceMappingURL=server.js.map