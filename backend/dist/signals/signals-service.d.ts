import { EventBus } from "../core/event-bus";
import { DataStore } from "../data/store";
import { Anomaly, MetricSeries } from "../types";
export declare class SignalsService {
    private store;
    private bus;
    private timers;
    constructor(store: DataStore, bus: EventBus);
    start(): void;
    stop(): void;
    private tick;
    private getRandomDelta;
    private applyEvent;
    private detectAnomaly;
    getMetrics(workspaceId: string): MetricSeries[];
    getAnomalies(workspaceId: string): Anomaly[];
    private seedMetric;
}
//# sourceMappingURL=signals-service.d.ts.map