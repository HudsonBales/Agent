import { EventEmitter } from "events";

type EventPayload = unknown;

export type AppEvents =
  | { type: "message.created"; payload: EventPayload }
  | { type: "workflow.run.completed"; payload: EventPayload }
  | { type: "signals.metric.updated"; payload: EventPayload }
  | { type: "signals.anomaly.detected"; payload: EventPayload }
  | { type: "ui.schema.generated"; payload: EventPayload };

export class EventBus {
  private emitter = new EventEmitter();

  emit(event: AppEvents["type"], payload: EventPayload) {
    this.emitter.emit(event, payload);
  }

  on<T extends AppEvents["type"]>(event: T, listener: (payload: EventPayload) => void) {
    this.emitter.on(event, listener);
  }
}
