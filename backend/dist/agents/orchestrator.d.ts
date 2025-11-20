import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
import { ChatStreamEvent } from "../types";
import { OpsIntelligenceAgent } from "./ops-intelligence-agent";
import { PlannerAgent } from "./planner-agent";
import { RemediationAgent } from "./remediation-agent";
import { UIDesignerAgent } from "./ui-designer-agent";
interface OrchestratorRequest {
    workspaceId: string;
    sessionId: string;
    message: string;
    actorId: string;
}
export declare class AgentOrchestrator {
    private store;
    private planner;
    private ops;
    private uiDesigner;
    private remediation;
    private gateway;
    constructor(store: DataStore, planner: PlannerAgent, ops: OpsIntelligenceAgent, uiDesigner: UIDesignerAgent, remediation: RemediationAgent, gateway: MCPGateway);
    runChat(request: OrchestratorRequest): AsyncGenerator<ChatStreamEvent>;
}
export {};
//# sourceMappingURL=orchestrator.d.ts.map