import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class SupabaseConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    requiresConnection: boolean;
    tools: ({
        id: string;
        name: string;
        description: string;
        args: {
            metric: string;
            range: string;
            retries?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            retries: string;
            metric?: never;
            range?: never;
        };
    })[];
    execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext): Promise<{
        workspaceId: string;
        range: string;
        totalUsers: number;
        newUsers: number;
        activationRate: number;
        sampleUsers: {
            id: string;
            email: string | undefined;
            createdAt: string | undefined;
        }[];
        status?: never;
        functionName?: never;
        retries?: never;
        response?: never;
    } | {
        status: string;
        functionName: string;
        retries: number;
        response: any;
        workspaceId?: never;
        range?: never;
        totalUsers?: never;
        newUsers?: never;
        activationRate?: never;
        sampleUsers?: never;
    }>;
    private getConfig;
    private getRangeDays;
    private fetchSupabase;
    private invokeFunction;
}
//# sourceMappingURL=supabase-connector.d.ts.map