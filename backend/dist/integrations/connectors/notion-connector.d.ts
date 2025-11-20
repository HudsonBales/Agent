import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class NotionConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    tools: {
        id: string;
        name: string;
        description: string;
        args: {
            title: string;
            content: string;
        };
    }[];
    execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext): Promise<{
        pageId: string;
        title: unknown;
        status: string;
        workspaceId: string;
    }>;
}
//# sourceMappingURL=notion-connector.d.ts.map