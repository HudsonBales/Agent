import { ToolDescription } from "../types";
export declare class MCPClient {
    private command;
    private args;
    private process;
    private messageId;
    private pendingRequests;
    constructor(command: string, args?: string[]);
    connect(): Promise<void>;
    listTools(): Promise<ToolDescription[]>;
    callTool(name: string, args: Record<string, unknown>): Promise<any>;
    private getNamespace;
    private sendRequest;
    private handleResponse;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=mcp-client.d.ts.map