import { SignalsService } from "../signals/signals-service";
import { Insight } from "../types";
export declare class OpsIntelligenceAgent {
    private signals;
    private llm?;
    constructor(signals: SignalsService, apiKey?: string | undefined);
    generateInsights(workspaceId: string): Promise<Insight[]>;
    private buildFallbackInsights;
}
//# sourceMappingURL=ops-intelligence-agent.d.ts.map