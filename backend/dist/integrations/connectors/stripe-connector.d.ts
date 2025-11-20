import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class StripeConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    tools: ({
        id: string;
        name: string;
        description: string;
        args: {
            range: string;
            limit?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            limit: string;
            range?: never;
        };
    })[];
    execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext): Promise<{
        id: string;
        customer: string;
        amount: number;
        currency: string;
        failureReason: string;
    }[] | {
        workspaceId: string;
        range: string;
        arr: number;
        mrr: number;
        currency: string;
        growthRate: number;
    }>;
}
//# sourceMappingURL=stripe-connector.d.ts.map