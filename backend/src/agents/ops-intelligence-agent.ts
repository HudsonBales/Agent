import { SignalsService } from "../signals/signals-service";
import { Insight } from "../types";

export class OpsIntelligenceAgent {
  constructor(private signals: SignalsService) {}

  generateInsights(workspaceId: string): Insight[] {
    const metrics = this.signals.getMetrics(workspaceId);
    const anomalies = this.signals.getAnomalies(workspaceId);
    const insights: Insight[] = [];
    if (metrics.length > 0) {
      const mrr = metrics.find((metric) => metric.id.includes("mrr"));
      if (mrr && mrr.points.length > 0) {
        const latest = mrr.points[mrr.points.length - 1]!;
        insights.push({
          id: `insight-mrr-${latest.timestamp}`,
          workspaceId,
          text: `MRR is now $${latest.value.toFixed(0)} (${mrr.unit}).`,
          category: "metric",
          createdAt: new Date().toISOString()
        });
      }
    }
    anomalies.slice(0, 3).forEach((anomaly) =>
      insights.push({
        id: `${anomaly.id}-insight`,
        workspaceId,
        text: `${anomaly.title}: ${anomaly.description}`,
        category: "incident",
        createdAt: anomaly.detectedAt
      })
    );
    return insights;
  }
}
