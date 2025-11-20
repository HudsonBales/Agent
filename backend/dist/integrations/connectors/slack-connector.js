"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackConnector = void 0;
class SlackConnector {
    constructor() {
        this.id = "slack";
        this.name = "Slack";
        this.namespace = "slack";
        this.tools = [
            {
                id: "slack.notify_channel",
                name: "Post channel notification",
                description: "Posts templated message to a Slack channel.",
                args: { channel: "Target channel", template: "Message template" }
            }
        ];
    }
    async execute(toolId, args, context) {
        if (toolId !== "slack.notify_channel") {
            throw new Error(`Unknown Slack tool: ${toolId}`);
        }
        return {
            status: "sent",
            channel: args.channel,
            template: args.template,
            sentAt: new Date().toISOString(),
            workspaceId: context.workspaceId
        };
    }
}
exports.SlackConnector = SlackConnector;
//# sourceMappingURL=slack-connector.js.map