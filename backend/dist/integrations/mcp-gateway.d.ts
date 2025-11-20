import { IntegrationContext, ToolDescription } from "../types";
export declare class MCPGateway {
    private connectors;
    constructor();
    private registerConnector;
    listTools(): ToolDescription[];
    execute(context: IntegrationContext, toolId: string, args: Record<string, unknown>): Promise<Record<string, unknown>>;
    private findConnector;
}
//# sourceMappingURL=mcp-gateway.d.ts.map