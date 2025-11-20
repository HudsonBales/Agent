import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";

export class StripeConnector implements IntegrationConnector {
  id = "stripe";
  name = "Stripe";
  namespace = "stripe";
  tools = [
    {
      id: "stripe.metrics",
      name: "Fetch revenue metrics",
      description: "Returns ARR/MRR summaries with growth rates.",
      args: { range: "Supported values: 7d, 30d, 90d" }
    },
    {
      id: "stripe.list_failed",
      name: "List failed payments",
      description: "Lists failed invoices for manual review.",
      args: { limit: "Max number of invoices" }
    }
  ];

  async execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext) {
    if (toolId === "stripe.metrics") {
      const range = (args.range as string) ?? "7d";
      return {
        workspaceId: context.workspaceId,
        range,
        arr: 120_000 + Math.round(Math.random() * 4000),
        mrr: 10_000 + Math.round(Math.random() * 600),
        currency: "USD",
        growthRate: Number((Math.random() * 5).toFixed(2))
      };
    }
    if (toolId === "stripe.list_failed") {
      const limit = Number(args.limit ?? 3);
      return Array.from({ length: limit }).map((_, idx) => ({
        id: `in_${idx}${Date.now()}`,
        customer: `cust_${idx}`,
        amount: 1200 + idx * 130,
        currency: "USD",
        failureReason: idx % 2 === 0 ? "insufficient_funds" : "expired_card"
      }));
    }
    throw new Error(`Unknown Stripe tool: ${toolId}`);
  }
}
