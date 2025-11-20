import { WorkflowEngine } from "../workflows/engine";
import { Anomaly } from "../types";

interface RemediationSuggestion {
  workflowId: string;
  title: string;
  reason: string;
}

export class RemediationAgent {
  constructor(private workflows: WorkflowEngine) {}

  suggest(workspaceId: string, anomalies: Anomaly[]): RemediationSuggestion[] {
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
