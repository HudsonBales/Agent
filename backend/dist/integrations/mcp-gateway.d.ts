import { IntegrationContext, ToolDescription } from "../types";
import { DataStore } from "../data/store";
export declare class MCPGateway {
    private store;
    private connectors;
    private mcpIntegrations;
    constructor(store: DataStore);
    private registerConnector;
    private registerMCPIntegration;
    listTools(): Promise<ToolDescription[]>;
    execute(context: IntegrationContext, toolId: string, args: Record<string, unknown>): Promise<Record<string, unknown>>;
    private findConnector;
    private enrichContext;
    private executeMCPTool;
}
//# sourceMappingURL=mcp-gateway.d.ts.map