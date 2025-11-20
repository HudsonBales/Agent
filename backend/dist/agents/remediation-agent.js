"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationAgent = void 0;
class RemediationAgent {
    constructor(workflows) {
        this.workflows = workflows;
    }
    suggest(workspaceId, anomalies) {
        const definitions = this.workflows.listDefinitions(workspaceId);
        return anomalies.slice(0, 2).map((anomaly, idx) => {
            const workflow = definitions[idx % definitions.length];
            return {
                workflowId: workflow?.id ?? "wf-placeholder",
                title: `Run ${workflow?.name ?? "custom remediation"}`,
                reason: anomaly.title
            };
        });
    }
}
exports.RemediationAgent = RemediationAgent;
//# sourceMappingURL=remediation-agent.js.map