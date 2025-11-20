"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsService = void 0;
const nanoid_1 = require("nanoid");
class SignalsService {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
        this.timers = [];
    }
    start() {
        // Periodically update metrics to mimic streaming telemetry.
        this.stop();
        this.store.listMetrics("ws-demo").forEach((metric) => this.seedMetric(metric));
        const timer = setInterval(() => this.tick(), 10000);
        this.timers.push(timer);
    }
    stop() {
        this.timers.forEach((timer) => clearInterval(timer));
        this.timers = [];
    }
    tick() {
        const metrics = this.store.listMetrics("ws-demo");
        const events = metrics.map((metric) => ({
            metricId: metric.id,
            delta: this.getRandomDelta(metric),
            description: `Synthetic update for ${metric.name}`
        }));
        events.forEach((event) => this.applyEvent(event));
    }
    getRandomDelta(metric) {
        const volatility = metric.unit === "percent" ? 0.3 : 50;
        return Number((Math.random() * volatility - volatility / 2).toFixed(2));
    }
    applyEvent(event) {
        const metric = this.store.listMetrics("ws-demo").find((m) => m.id === event.metricId);
        if (!metric) {
            return;
        }
        const lastPoint = metric.points[metric.points.length - 1];
        if (!lastPoint)
            return;
        const nextValue = Math.max(0, lastPoint.value + event.delta);
        const nextPoint = { timestamp: new Date().toISOString(), value: Number(nextValue.toFixed(2)) };
        const updated = { ...metric, points: [...metric.points.slice(-29), nextPoint] };
        this.store.saveMetric(updated);
        this.bus.emit("signals.metric.updated", { metricId: updated.id, latest: nextPoint });
        this.detectAnomaly(updated);
    }
    detectAnomaly(metric) {
        if (metric.points.length < 6)
            return;
        const recent = metric.points.slice(-3);
        const baseline = metric.points.slice(-6, -3);
        const recentAvg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
        const baselineAvg = baseline.reduce((sum, point) => sum + point.value, 0) / baseline.length;
        if (baselineAvg === 0)
            return;
        const delta = Math.abs(recentAvg - baselineAvg) / baselineAvg;
        if (delta > 0.15) {
            const anomaly = {
                id: `anom-${(0, nanoid_1.nanoid)(8)}`,
                workspaceId: metric.workspaceId,
                metricId: metric.id,
                title: `${metric.name} moved ${Math.round(delta * 100)}% vs baseline`,
                description: `${metric.name} changed from ${baselineAvg.toFixed(2)} to ${recentAvg.toFixed(2)}.`,
                severity: delta > 0.3 ? "high" : "medium",
                detectedAt: new Date().toISOString(),
                baseline: Number(baselineAvg.toFixed(2)),
                observed: Number(recentAvg.toFixed(2))
            };
            this.store.saveAnomaly(anomaly);
            this.bus.emit("signals.anomaly.detected", anomaly);
        }
    }
    getMetrics(workspaceId) {
        return this.store.listMetrics(workspaceId);
    }
    getAnomalies(workspaceId) {
        return this.store.listAnomalies(workspaceId);
    }
    seedMetric(metric) {
        this.store.saveMetric(metric);
    }
}
exports.SignalsService = SignalsService;
//# sourceMappingURL=signals-service.js.map