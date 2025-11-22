"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../data/store");
const seed_1 = require("../data/seed");
const event_bus_1 = require("../core/event-bus");
const signals_service_1 = require("../signals/signals-service");
const engine_1 = require("../workflows/engine");
const mcp_gateway_1 = require("../integrations/mcp-gateway");
const planner_agent_1 = require("../agents/planner-agent");
const ops_intelligence_agent_1 = require("../agents/ops-intelligence-agent");
const ui_designer_agent_1 = require("../agents/ui-designer-agent");
const ui_experience_service_1 = require("../experience/ui-experience-service");
const remediation_agent_1 = require("../agents/remediation-agent");
const orchestrator_1 = require("../agents/orchestrator");
async function runSoakTest(iterations, workspaceId) {
    const bus = new event_bus_1.EventBus();
    const store = new store_1.DataStore(seed_1.seedData);
    const gateway = new mcp_gateway_1.MCPGateway(store);
    const signals = new signals_service_1.SignalsService(store, bus);
    const ui = new ui_experience_service_1.UIExperienceService(store, bus);
    const workflows = new engine_1.WorkflowEngine(store, gateway, bus);
    const planner = new planner_agent_1.PlannerAgent();
    const ops = new ops_intelligence_agent_1.OpsIntelligenceAgent(signals);
    const remediation = new remediation_agent_1.RemediationAgent(workflows);
    const uiDesigner = new ui_designer_agent_1.UIDesignerAgent(ui);
    const orchestrator = new orchestrator_1.AgentOrchestrator(store, planner, ops, uiDesigner, remediation, gateway);
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
            if (event.type === "plan")
                stats.plan += 1;
            if (event.type === "insight")
                stats.insight += 1;
            if (event.type === "ui_schema")
                stats.ui += 1;
            if (event.type === "final")
                stats.finals += 1;
            if (event.type === "tool_call" && event.data?.status === "error")
                stats.toolErrors += 1;
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
    }
    catch (error) {
        console.error("[soak] failed", error);
        process.exit(1);
    }
})();
//# sourceMappingURL=soak-test.js.map