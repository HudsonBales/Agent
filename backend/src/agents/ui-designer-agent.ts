import { UIExperienceService } from "../experience/ui-experience-service";
import { UISchema } from "../types";

export class UIDesignerAgent {
  constructor(private uiService: UIExperienceService) {}

  async design(workspaceId: string, context: string): Promise<UISchema> {
    return this.uiService.regenerate(workspaceId, context);
  }
}
