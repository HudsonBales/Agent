import { nanoid } from "nanoid";
import { EventBus } from "../core/event-bus";
import { DataStore } from "../data/store";
import { Anomaly, MetricPoint, MetricSeries } from "../types";

interface SyntheticEvent {
  metricId: string;
  delta: number;
  description: string;
}

export class SignalsService {
  private timers: NodeJS.Timeout[] = [];

  constructor(private store: DataStore, private bus: EventBus) {}

  start() {
    // Periodically update metrics to mimic streaming telemetry.
    this.stop();
    this.store.listMetrics("ws-demo").forEach((metric) => this.seedMetric(metric));
    const timer = setInterval(() => this.tick(), 10_000);
    this.timers.push(timer);
  }

  stop() {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers = [];
  }

  private tick() {
    const metrics = this.store.listMetrics("ws-demo");
    const events: SyntheticEvent[] = metrics.map((metric) => ({
      metricId: metric.id,
      delta: this.getRandomDelta(metric),
      description: `Synthetic update for ${metric.name}`
    }));
    events.forEach((event) => this.applyEvent(event));
  }

  private getRandomDelta(metric: MetricSeries) {
    const volatility = metric.unit === "percent" ? 0.3 : 50;
    return Number((Math.random() * volatility - volatility / 2).toFixed(2));
  }

  private applyEvent(event: SyntheticEvent) {
    const metric = this.store.listMetrics("ws-demo").find((m) => m.id === event.metricId);
    if (!metric) {
      return;
    }
    const lastPoint = metric.points[metric.points.length - 1];
    if (!lastPoint) return;
    const nextValue = Math.max(0, lastPoint.value + event.delta);
    const nextPoint: MetricPoint = { timestamp: new Date().toISOString(), value: Number(nextValue.toFixed(2)) };
    const updated: MetricSeries = { ...metric, points: [...metric.points.slice(-29), nextPoint] };
    this.store.saveMetric(updated);
    this.bus.emit("signals.metric.updated", { metricId: updated.id, latest: nextPoint });
    this.detectAnomaly(updated);
  }

  private detectAnomaly(metric: MetricSeries) {
    if (metric.points.length < 6) return;
    const recent = metric.points.slice(-3);
    const baseline = metric.points.slice(-6, -3);
    const recentAvg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
    const baselineAvg = baseline.reduce((sum, point) => sum + point.value, 0) / baseline.length;
    if (baselineAvg === 0) return;
    const delta = Math.abs(recentAvg - baselineAvg) / baselineAvg;
    if (delta > 0.15) {
      const anomaly: Anomaly = {
        id: `anom-${nanoid(8)}`,
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

  getMetrics(workspaceId: string) {
    return this.store.listMetrics(workspaceId);
  }

  getAnomalies(workspaceId: string) {
    return this.store.listAnomalies(workspaceId);
  }

  private seedMetric(metric: MetricSeries) {
    this.store.saveMetric(metric);
  }
}
