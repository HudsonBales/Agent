import { AgentOrchestrator } from "../agents/orchestrator";
import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
import { SignalsService } from "../signals/signals-service";
import { WorkflowEngine } from "../workflows/engine";
import { UIExperienceService } from "../experience/ui-experience-service";
interface ApiDeps {
    store: DataStore;
    orchestrator: AgentOrchestrator;
    gateway: MCPGateway;
    signals: SignalsService;
    workflows: WorkflowEngine;
    ui: UIExperienceService;
}
export declare function createApp(deps: ApiDeps): import("express-serve-static-core").Express;
export {};
//# sourceMappingURL=router.d.ts.map