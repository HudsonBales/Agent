import { WorkflowEngine } from "../workflows/engine";
import { Anomaly } from "../types";
interface RemediationSuggestion {
    workflowId: string;
    title: string;
    reason: string;
}
export declare class RemediationAgent {
    private workflows;
    private llm?;
    constructor(workflows: WorkflowEngine, apiKey?: string | undefined);
    suggest(workspaceId: string, anomalies: Anomaly[]): Promise<RemediationSuggestion[]>;
    private buildFallback;
}
export {};
//# sourceMappingURL=remediation-agent.d.ts.map