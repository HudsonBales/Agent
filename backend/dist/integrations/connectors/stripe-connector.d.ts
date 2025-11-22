import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class StripeConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    requiresConnection: boolean;
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
        customer: string | undefined;
        amount: number;
        currency: string;
        createdAt: string;
        failureReason: string;
        failureMessage: string | undefined;
    }[] | {
        workspaceId: string;
        range: string;
        arr: number;
        mrr: number;
        totalPayments: number;
        successfulPayments: number;
        failedPayments: number;
        currency: string;
        grossVolume: number;
        netVolume: number;
    }>;
    private getApiKey;
    private getRangeDays;
    private getSinceSeconds;
    private fetchStripe;
}
//# sourceMappingURL=stripe-connector.d.ts.map