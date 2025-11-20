import { IntegrationContext } from "../../types";
export interface ToolSchema {
    id: string;
    name: string;
    description: string;
    args: Record<string, string>;
}
export interface IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    tools: ToolSchema[];
    execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext): Promise<unknown>;
}
//# sourceMappingURL=base.d.ts.map