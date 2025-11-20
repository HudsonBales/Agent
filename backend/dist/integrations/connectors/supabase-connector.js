"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseConnector = void 0;
class SupabaseConnector {
    constructor() {
        this.id = "supabase";
        this.name = "Supabase Analytics";
        this.namespace = "supabase";
        this.tools = [
            {
                id: "supabase.analytics",
                name: "Query product metrics",
                description: "Returns funnel and activation metrics.",
                args: { metric: "conversion_rate|activation_rate", range: "7d|30d" }
            },
            {
                id: "supabase.sync_subscription",
                name: "Retry subscription sync",
                description: "Retries syncing Stripe subscription data.",
                args: { retries: "Number of retries" }
            }
        ];
    }
    async execute(toolId, args, context) {
        if (toolId === "supabase.analytics") {
            return {
                metric: args.metric ?? "conversion_rate",
                range: args.range ?? "7d",
                series: Array.from({ length: 7 }).map((_, idx) => ({
                    day: idx,
                    value: Number((7 + Math.random() * 2 - idx * 0.1).toFixed(2))
                }))
            };
        }
        if (toolId === "supabase.sync_subscription") {
            return {
                status: "ok",
                retries: args.retries ?? 1,
                message: "Subscription sync retried with exponential backoff."
            };
        }
        throw new Error(`Unknown Supabase tool: ${toolId}`);
    }
}
exports.SupabaseConnector = SupabaseConnector;
//# sourceMappingURL=supabase-connector.js.map