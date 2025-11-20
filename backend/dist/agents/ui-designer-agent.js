"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIDesignerAgent = void 0;
class UIDesignerAgent {
    constructor(uiService) {
        this.uiService = uiService;
    }
    async design(workspaceId, context) {
        return this.uiService.regenerate(workspaceId, context);
    }
}
exports.UIDesignerAgent = UIDesignerAgent;
//# sourceMappingURL=ui-designer-agent.js.map