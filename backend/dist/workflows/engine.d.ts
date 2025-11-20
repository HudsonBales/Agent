import { EventBus } from "../core/event-bus";
import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
import { WorkflowDefinition, WorkflowRun } from "../types";
interface RunContext {
    workspaceId: string;
    actorId: string;
    reason?: string;
}
export declare class WorkflowEngine {
    private store;
    private gateway;
    private bus;
    private scheduleCursor;
    private timer;
    constructor(store: DataStore, gateway: MCPGateway, bus: EventBus);
    listDefinitions(workspaceId: string): WorkflowDefinition[];
    listRuns(workspaceId: string): WorkflowRun[];
    start(): void;
    stop(): void;
    private scanSchedules;
    runWorkflow(definitionId: string, context: RunContext): Promise<WorkflowRun>;
}
export {};
//# sourceMappingURL=engine.d.ts.map