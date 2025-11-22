import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";
export declare class GitHubConnector implements IntegrationConnector {
    id: string;
    name: string;
    namespace: string;
    tools: ({
        id: string;
        name: string;
        description: string;
        args: {
            visibility: string;
            owner?: never;
            repo?: never;
            title?: never;
            body?: never;
            state?: never;
            issue_number?: never;
            head?: never;
            base?: never;
            pull_number?: never;
            merge_method?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            owner: string;
            repo: string;
            title: string;
            body: string;
            visibility?: never;
            state?: never;
            issue_number?: never;
            head?: never;
            base?: never;
            pull_number?: never;
            merge_method?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            owner: string;
            repo: string;
            state: string;
            visibility?: never;
            title?: never;
            body?: never;
            issue_number?: never;
            head?: never;
            base?: never;
            pull_number?: never;
            merge_method?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            owner: string;
            repo: string;
            issue_number: string;
            visibility?: never;
            title?: never;
            body?: never;
            state?: never;
            head?: never;
            base?: never;
            pull_number?: never;
            merge_method?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            owner: string;
            repo: string;
            issue_number: string;
            title: string;
            body: string;
            state: string;
            visibility?: never;
            head?: never;
            base?: never;
            pull_number?: never;
            merge_method?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            owner: string;
            repo: string;
            title: string;
            body: string;
            head: string;
            base: string;
            visibility?: never;
            state?: never;
            issue_number?: never;
            pull_number?: never;
            merge_method?: never;
        };
    } | {
        id: string;
        name: string;
        description: string;
        args: {
            owner: string;
            repo: string;
            pull_number: string;
            merge_method: string;
            visibility?: never;
            title?: never;
            body?: never;
            state?: never;
            issue_number?: never;
            head?: never;
            base?: never;
        };
    })[];
    execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext): Promise<{
        id: number;
        name: string;
        full_name: string;
        private: boolean;
        description: string;
        url: string;
    }[] | {
        id: number;
        number: number;
        title: unknown;
        body: unknown;
        state: string;
        created_at: string;
        url: string;
        updated_at?: never;
        merged?: never;
        message?: never;
    } | {
        id: number;
        number: number;
        title: string;
        state: string;
        created_at: string;
        url: string;
    }[] | {
        id: number;
        number: unknown;
        title: string;
        body: string;
        state: string;
        created_at: string;
        updated_at: string;
        url: string;
        merged?: never;
        message?: never;
    } | {
        id: number;
        number: unknown;
        title: unknown;
        body: unknown;
        state: unknown;
        updated_at: string;
        url: string;
        created_at?: never;
        merged?: never;
        message?: never;
    } | {
        id: number;
        number: number;
        title: unknown;
        state: string;
        created_at: string;
        url: string;
        body?: never;
        updated_at?: never;
        merged?: never;
        message?: never;
    } | {
        merged: boolean;
        message: string;
        id?: never;
        number?: never;
        title?: never;
        body?: never;
        state?: never;
        created_at?: never;
        url?: never;
        updated_at?: never;
    }>;
}
//# sourceMappingURL=github-connector.d.ts.map