import { EventBus } from "../core/event-bus";
import { DataStore } from "../data/store";
import { UISchema } from "../types";
export declare class UIExperienceService {
    private store;
    private bus;
    constructor(store: DataStore, bus: EventBus);
    getLatestSchema(workspaceId: string, context: string): UISchema | undefined;
    regenerate(workspaceId: string, context: string): UISchema;
}
//# sourceMappingURL=ui-experience-service.d.ts.map