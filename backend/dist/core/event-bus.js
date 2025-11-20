"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
class EventBus {
    constructor() {
        this.emitter = new events_1.EventEmitter();
    }
    emit(event, payload) {
        this.emitter.emit(event, payload);
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=event-bus.js.map