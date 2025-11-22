"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemediationAgent = void 0;
const llm_service_1 = require("../core/llm-service");
class RemediationAgent {
    constructor(workflows, apiKey = process.env.OPENAI_API_KEY) {
        this.workflows = workflows;
        if (!apiKey) {
            console.warn("OPENAI_API_KEY not set. RemediationAgent will emit heuristic suggestions.");
            return;
        }
        this.llm = new llm_service_1.LLMService(apiKey);
    }
    async suggest(workspaceId, anomalies) {
        // If no anomalies, return empty array
        if (anomalies.length === 0) {
            return [];
        }
        const definitions = this.workflows.listDefinitions(workspaceId);
        // Use LLM to generate intelligent remediation suggestions
        const systemPrompt = `You are an AI operations expert for a SaaS business.
    Your job is to analyze system anomalies and recommend appropriate remediation workflows.
    
    Consider:
    - The severity of the anomaly
    - The type of issue (revenue, user experience, system health)
    - Available workflows and their capabilities
    - Best practices for incident response
    
    Return a JSON array of remediation suggestions, selecting the most appropriate workflow for each anomaly.`;
        const prompt = `Analyze these anomalies and recommend remediation workflows:
    
    Anomalies:
    ${anomalies.map(a => `- ${a.title}: ${a.description} (Severity: ${a.severity})`).join('\n')}
    
    Available Workflows:
    ${definitions.map(w => `- ${w.id}: ${w.name} - ${w.description}`).join('\n') || 'None available'}
    
    Generate 1-3 remediation suggestions in JSON format:
    {
      "suggestions": [
        {
          "workflowId": "workflow identifier",
          "title": "suggested action title",
          "reason": "brief explanation"
        }
      ]
    }`;
        if (!this.llm) {
            return this.buildFallback(definitions, anomalies);
        }
        try {
            const result = await this.llm.generateStructuredOutput(prompt, systemPrompt);
            // Validate that suggested workflows exist
            return result.suggestions.filter((suggestion) => definitions.some((w) => w.id === suggestion.workflowId));
        }
        catch (error) {
            console.error("LLM remediation suggestions failed, using fallback:", error);
            return this.buildFallback(definitions, anomalies);
        }
    }
    buildFallback(definitions, anomalies) {
        if (definitions.length === 0) {
            return anomalies.slice(0, 2).map((anomaly) => ({
                workflowId: "manual-remediation",
                title: "Escalate to operations",
                reason: anomaly.title
            }));
        }
        return anomalies.slice(0, 2).map((anomaly, idx) => {
            const workflow = definitions[idx % definitions.length];
            return {
                workflowId: workflow.id,
                title: `Run ${workflow.name}`,
                reason: anomaly.title
            };
        });
    }
}
exports.RemediationAgent = RemediationAgent;
//# sourceMappingURL=remediation-agent.js.map