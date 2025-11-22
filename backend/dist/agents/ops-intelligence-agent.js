"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpsIntelligenceAgent = void 0;
const llm_service_1 = require("../core/llm-service");
class OpsIntelligenceAgent {
    constructor(signals, apiKey = process.env.OPENAI_API_KEY) {
        this.signals = signals;
        if (!apiKey) {
            console.warn("OPENAI_API_KEY not set. OpsIntelligenceAgent will use heuristic insights.");
            return;
        }
        this.llm = new llm_service_1.LLMService(apiKey);
    }
    async generateInsights(workspaceId) {
        const metrics = this.signals.getMetrics(workspaceId);
        const anomalies = this.signals.getAnomalies(workspaceId);
        // For simple cases with no data, return empty array
        if (metrics.length === 0 && anomalies.length === 0) {
            return [];
        }
        // Use LLM to generate natural language insights
        const systemPrompt = `You are an AI operations intelligence assistant for a SaaS business.
    Your job is to analyze business metrics and anomalies to generate concise, actionable insights.
    
    Focus on:
    - Significant changes in key metrics (MRR, churn, etc.)
    - Correlations between different metrics
    - Potential root causes of anomalies
    - Actionable recommendations
    
    Keep insights brief but valuable. Aim for 1-2 sentences per insight.`;
        const prompt = `Analyze this SaaS business data and generate insights:
    
    Metrics:
    ${metrics.map(m => `- ${m.name}: ${m.points[m.points.length - 1]?.value ?? 'N/A'} ${m.unit}`).join('\n')}
    
    Anomalies:
    ${anomalies.map(a => `- ${a.title}: ${a.description}`).join('\n') || 'None detected'}
    
    Generate 3-5 insights in JSON format:
    {
      "insights": [
        {
          "text": "insight description",
          "category": "metric|incident|suggestion"
        }
      ]
    }`;
        if (!this.llm) {
            return this.buildFallbackInsights(workspaceId, metrics, anomalies);
        }
        try {
            const result = await this.llm.generateStructuredOutput(prompt, systemPrompt);
            return result.insights.map((insight, index) => ({
                id: `llm-insight-${Date.now()}-${index}`,
                workspaceId,
                text: insight.text,
                category: insight.category,
                createdAt: new Date().toISOString()
            }));
        }
        catch (error) {
            console.error("LLM insights failed, using fallback:", error);
            return this.buildFallbackInsights(workspaceId, metrics, anomalies);
        }
    }
    buildFallbackInsights(workspaceId, metrics, anomalies) {
        const insights = [];
        if (metrics.length > 0) {
            const mrr = metrics.find((metric) => metric.id.includes("mrr"));
            if (mrr && mrr.points.length > 0) {
                const latest = mrr.points[mrr.points.length - 1];
                insights.push({
                    id: `insight-mrr-${latest.timestamp}`,
                    workspaceId,
                    text: `MRR is now $${latest.value.toFixed(0)} (${mrr.unit}).`,
                    category: "metric",
                    createdAt: new Date().toISOString()
                });
            }
        }
        anomalies.slice(0, 3).forEach((anomaly) => insights.push({
            id: `${anomaly.id}-insight`,
            workspaceId,
            text: `${anomaly.title}: ${anomaly.description}`,
            category: "incident",
            createdAt: anomaly.detectedAt
        }));
        return insights;
    }
}
exports.OpsIntelligenceAgent = OpsIntelligenceAgent;
//# sourceMappingURL=ops-intelligence-agent.js.map