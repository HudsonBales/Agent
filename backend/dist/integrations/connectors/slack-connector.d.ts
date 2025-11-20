import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class SlackConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    tools: {
        id: string;
        name: string;
        description: string;
        args: {
            channel: string;
            template: string;
        };
    }[];
    execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext): Promise<{
        status: string;
        channel: unknown;
        template: unknown;
        sentAt: string;
        workspaceId: string;
    }>;
}
//# sourceMappingURL=slack-connector.d.ts.map