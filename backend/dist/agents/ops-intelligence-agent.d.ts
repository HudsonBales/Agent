import { SignalsService } from "../signals/signals-service";
import { Insight } from "../types";
export declare class OpsIntelligenceAgent {
    private signals;
    constructor(signals: SignalsService);
    generateInsights(workspaceId: string): Insight[];
}
//# sourceMappingURL=ops-intelligence-agent.d.ts.map