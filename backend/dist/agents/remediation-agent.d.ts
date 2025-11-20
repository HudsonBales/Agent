import { WorkflowEngine } from "../workflows/engine";
import { Anomaly } from "../types";
interface RemediationSuggestion {
    workflowId: string;
    title: string;
    reason: string;
}
export declare class RemediationAgent {
    private workflows;
    constructor(workflows: WorkflowEngine);
    suggest(workspaceId: string, anomalies: Anomaly[]): RemediationSuggestion[];
}
export {};
//# sourceMappingURL=remediation-agent.d.ts.map