import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class SupabaseConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
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
        metric: {};
        range: {};
        series: {
            day: number;
            value: number;
        }[];
        status?: never;
        retries?: never;
        message?: never;
    } | {
        status: string;
        retries: {};
        message: string;
        metric?: never;
        range?: never;
        series?: never;
    }>;
}
//# sourceMappingURL=supabase-connector.d.ts.map