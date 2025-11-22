import { IntegrationConnector } from "./base";
import { IntegrationContext } from "../../types";

type StripePaymentIntent = {
  id: string;
  amount: number;
  amount_received: number;
  currency: string;
  status: string;
  created: number;
  customer?: string;
  last_payment_error?: {
    code?: string;
    message?: string;
  };
};

interface StripeListResponse<T> {
  data: T[];
  has_more: boolean;
}

export class StripeConnector implements IntegrationConnector {
  id = "stripe";
  name = "Stripe";
  namespace = "stripe";
  requiresConnection = true;
  tools = [
    {
      id: "stripe.metrics",
      name: "Fetch revenue metrics",
      description: "Returns live payment volume metrics directly from Stripe.",
      args: { range: "Supported values: 7d, 30d, 90d" }
    },
    {
      id: "stripe.list_failed",
      name: "List failed payments",
      description: "Lists failed payment intents for manual review.",
      args: { limit: "Max number of invoices" }
    }
  ];

  async execute(toolId: string, args: Record<string, unknown>, context: IntegrationContext) {
    const apiKey = this.getApiKey(context);
    if (!apiKey) {
      throw new Error("Stripe API key missing. Connect Stripe or set STRIPE_API_KEY.");
    }

    if (toolId === "stripe.metrics") {
      const range = (args.range as string) ?? "7d";
      const seconds = this.getSinceSeconds(range);
      const response = await this.fetchStripe<StripePaymentIntent>(apiKey, "payment_intents", {
        limit: 100,
        "created[gte]": seconds.toString()
      });
      const totals = response.data.reduce(
        (acc, intent) => {
          acc.amountReceived += intent.amount_received ?? 0;
          acc.amount += intent.amount ?? 0;
          acc.successful += intent.status === "succeeded" ? 1 : 0;
          acc.failed += intent.status === "canceled" || intent.status.startsWith("requires") ? 1 : 0;
          acc.currency = intent.currency ?? acc.currency;
          return acc;
        },
        { amount: 0, amountReceived: 0, successful: 0, failed: 0, currency: "usd" }
      );

      const totalVolume = totals.amountReceived / 100;
      const arr = totalVolume * (365 / this.getRangeDays(range));
      const mrr = totalVolume * (30 / this.getRangeDays(range));

      return {
        workspaceId: context.workspaceId,
        range,
        arr: Number(arr.toFixed(2)),
        mrr: Number(mrr.toFixed(2)),
        totalPayments: response.data.length,
        successfulPayments: totals.successful,
        failedPayments: totals.failed,
        currency: totals.currency?.toUpperCase() ?? "USD",
        grossVolume: Number((totals.amount / 100).toFixed(2)),
        netVolume: Number(totalVolume.toFixed(2))
      };
    }

    if (toolId === "stripe.list_failed") {
      const limit = Math.min(Number(args.limit ?? 5), 50);
      const response = await this.fetchStripe<StripePaymentIntent>(apiKey, "payment_intents", {
        limit: 50
      });
      const failed = response.data.filter(
        (intent) => intent.status === "canceled" || intent.status.startsWith("requires")
      );
      return failed.slice(0, limit).map((intent) => ({
        id: intent.id,
        customer: intent.customer,
        amount: intent.amount / 100,
        currency: intent.currency?.toUpperCase() ?? "USD",
        createdAt: new Date(intent.created * 1000).toISOString(),
        failureReason: intent.last_payment_error?.code ?? intent.status,
        failureMessage: intent.last_payment_error?.message
      }));
    }

    throw new Error(`Unknown Stripe tool: ${toolId}`);
  }

  private getApiKey(context: IntegrationContext) {
    return context.connection?.accessToken || process.env.STRIPE_API_KEY;
  }

  private getRangeDays(range: string) {
    switch (range) {
      case "30d":
        return 30;
      case "90d":
        return 90;
      default:
        return 7;
    }
  }

  private getSinceSeconds(range: string) {
    const days = this.getRangeDays(range);
    return Math.floor(Date.now() / 1000 - days * 86_400);
  }

  private async fetchStripe<T>(
    apiKey: string,
    path: string,
    params?: Record<string, string | number>
  ): Promise<StripeListResponse<T>> {
    const url = new URL(`https://api.stripe.com/v1/${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stripe API ${response.status}: ${errorText}`);
    }

    const payload = (await response.json()) as StripeListResponse<T>;
    return payload;
  }
}
