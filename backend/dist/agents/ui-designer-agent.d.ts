import { UIExperienceService } from "../experience/ui-experience-service";
import { UISchema } from "../types";
export declare class UIDesignerAgent {
    private uiService;
    constructor(uiService: UIExperienceService);
    design(workspaceId: string, context: string): Promise<UISchema>;
}
//# sourceMappingURL=ui-designer-agent.d.ts.map