"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIExperienceService = void 0;
const nanoid_1 = require("nanoid");
class UIExperienceService {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
    }
    getLatestSchema(workspaceId, context) {
        const schemas = this.store
            .listUISchemas(workspaceId, context)
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        return schemas[0];
    }
    regenerate(workspaceId, context) {
        const metrics = this.store.listMetrics(workspaceId);
        const anomalies = this.store.listAnomalies(workspaceId);
        const workflows = this.store.getWorkflows(workspaceId);
        const insights = this.store.listInsights(workspaceId);
        const schema = {
            id: `ui-${(0, nanoid_1.nanoid)(8)}`,
            workspaceId,
            context,
            version: Date.now(),
            createdAt: new Date().toISOString(),
            layout: {
                hero: {
                    title: context === "main_dashboard" ? "Ops Control Center" : "Generated View",
                    subtitle: `Generated at ${new Date().toLocaleTimeString()}`,
                    stats: metrics.slice(0, 3).map((metric) => ({
                        id: metric.id,
                        label: metric.name,
                        latest: metric.points[metric.points.length - 1]?.value ?? 0,
                        unit: metric.unit
                    }))
                },
                sections: [
                    {
                        type: "metrics",
                        title: "Key Metrics",
                        cards: metrics.slice(0, 4).map((metric) => ({
                            id: metric.id,
                            trend: metric.points.slice(-5),
                            unit: metric.unit
                        }))
                    },
                    {
                        type: "anomalies",
                        title: "Active Incidents",
                        items: anomalies.map((anomaly) => ({
                            id: anomaly.id,
                            text: anomaly.title,
                            severity: anomaly.severity,
                            delta: Number((anomaly.observed - anomaly.baseline).toFixed(2))
                        }))
                    },
                    {
                        type: "workflows",
                        title: "Automation",
                        flows: workflows.map((workflow) => ({
                            id: workflow.id,
                            name: workflow.name,
                            steps: workflow.steps.map((step) => ({ id: step.id, type: step.type, name: step.name }))
                        }))
                    },
                    {
                        type: "insights",
                        title: "Insights",
                        items: insights.map((insight) => ({ id: insight.id, text: insight.text, category: insight.category }))
                    }
                ]
            }
        };
        this.store.saveUISchema(schema);
        this.bus.emit("ui.schema.generated", { workspaceId, context, schemaId: schema.id });
        return schema;
    }
}
exports.UIExperienceService = UIExperienceService;
//# sourceMappingURL=ui-experience-service.js.map