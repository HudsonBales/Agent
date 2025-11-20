type EventPayload = unknown;
export type AppEvents = {
    type: "message.created";
    payload: EventPayload;
} | {
    type: "workflow.run.completed";
    payload: EventPayload;
} | {
    type: "signals.metric.updated";
    payload: EventPayload;
} | {
    type: "signals.anomaly.detected";
    payload: EventPayload;
} | {
    type: "ui.schema.generated";
    payload: EventPayload;
};
export declare class EventBus {
    private emitter;
    emit(event: AppEvents["type"], payload: EventPayload): void;
    on<T extends AppEvents["type"]>(event: T, listener: (payload: EventPayload) => void): void;
}
export {};
//# sourceMappingURL=event-bus.d.ts.map