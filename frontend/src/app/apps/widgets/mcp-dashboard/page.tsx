"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  OpenAIDevTools,
  SafeArea,
  useOpenAI,
  useOpenAIGlobal
} from "react-openai-apps-sdk";
import { useSearchParams } from "next/navigation";

type AppsWidgetState = {
  workspaceId?: string;
  toolId?: string;
  actorId?: string;
  source?: string;
  payload?: unknown;
  generatedAt?: string;
};

type Metric = {
  label: string;
  value: string;
  caption?: string;
};

type TableDescriptor = {
  columns: string[];
  rows: string[][];
  caption: string;
};

type NormalizedSnapshot = {
  workspaceId: string;
  toolId: string;
  actorId: string;
  generatedAt: string;
  source: string;
  metrics: Metric[];
  table?: TableDescriptor;
  payload: unknown;
};

const FALLBACK_WIDGET_STATE: AppsWidgetState = {
  workspaceId: "ws-demo",
  toolId: "stripe.metrics",
  actorId: "founder",
  source: "connector",
  generatedAt: new Date().toISOString(),
  payload: {
    workspaceId: "ws-demo",
    range: "30d",
    arr: 128000,
    mrr: 10650,
    totalPayments: 892,
    successfulPayments: 823,
    failedPayments: 69,
    currency: "USD",
    grossVolume: 192230,
    netVolume: 188004,
    latestFailures: [
      {
        id: "pi_3ND7f2ZPNkY5",
        customer: "acme@customer.io",
        amount: 499,
        failureReason: "card_declined",
        failureMessage: "Insufficient funds"
      },
      {
        id: "pi_3ND7f2ZPNkY6",
        customer: "cto@mega.dev",
        amount: 899,
        failureReason: "expired_card",
        failureMessage: "Card expired last month"
      }
    ]
  }
};

export default function MCPDashboardWidget() {
  const openai = useOpenAI();
  const widgetState = useOpenAIGlobal("widgetState") as AppsWidgetState | undefined;
  const toolOutput = useOpenAIGlobal("toolOutput") as AppsWidgetState | undefined;
  const theme = (useOpenAIGlobal("theme") as "light" | "dark" | undefined) ?? "dark";
  const params = useSearchParams();
  const [state, setState] = useState<AppsWidgetState>(FALLBACK_WIDGET_STATE);

  const forceMock = params?.get("mock") === "1";

  useEffect(() => {
    if (forceMock) {
      setState(FALLBACK_WIDGET_STATE);
      return;
    }

    const nextState = widgetState ?? toolOutput;
    if (nextState && Object.keys(nextState).length > 0) {
      setState({
        ...nextState,
        payload: (nextState.payload ?? (nextState as any).result) ?? FALLBACK_WIDGET_STATE.payload
      });
    }
  }, [widgetState, toolOutput, forceMock]);

  const normalized = useMemo(() => normalizeState(state), [state]);

  const handleRefresh = useCallback(
    async (toolId?: string) => {
      if (!openai || !toolId) {
        return;
      }
      try {
        await openai.callTool(toolId, { range: "30d" });
      } catch (error) {
        console.error("Failed to refresh tool output via Apps SDK", error);
      }
    },
    [openai]
  );

  return (
    <SafeArea fallbackHeight={580}>
      <div
        className={clsx(
          "min-h-[560px] rounded-3xl border p-5 transition-colors",
          theme === "dark"
            ? "border-white/5 bg-neutral-950 text-white"
            : "border-neutral-200 bg-white text-neutral-900"
        )}
      >
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-400">
              OpsPilot · MCP App Widget
            </p>
            <h1 className="text-2xl font-semibold">
              {normalized.toolId} · {normalized.workspaceId}
            </h1>
            <p className="text-sm text-neutral-400">
              Synced {new Date(normalized.generatedAt).toLocaleTimeString()} via{" "}
              {normalized.source.toUpperCase()} for {normalized.actorId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 hover:border-white/30 hover:text-white"
              onClick={() => handleRefresh(normalized.toolId)}
            >
              Refresh via MCP
            </button>
            <button
              className="rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/30"
              onClick={() => handleRefresh("stripe.list_failed")}
            >
              Pull latest failures
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          {normalized.metrics.map((metric) => (
            <article
              key={metric.label}
              className={clsx(
                "rounded-2xl border p-4",
                theme === "dark" ? "border-white/5 bg-white/5" : "border-neutral-200 bg-neutral-50"
              )}
            >
              <p className="text-xs uppercase tracking-wide text-neutral-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              {metric.caption ? (
                <p className="text-xs text-neutral-500">{metric.caption}</p>
              ) : null}
            </article>
          ))}
        </section>

        {normalized.table ? (
          <section
            className={clsx(
              "mt-6 rounded-2xl border p-4",
              theme === "dark" ? "border-white/5 bg-white/5" : "border-neutral-200 bg-neutral-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-neutral-400">MCP Stream</p>
                <h2 className="text-lg font-semibold">{normalized.table.caption}</h2>
              </div>
              <span className="text-xs text-neutral-400">
                {normalized.table.rows.length} records
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-neutral-400">
                  <tr>
                    {normalized.table.columns.map((col) => (
                      <th key={col} className="pb-2 pr-3 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {normalized.table.rows.map((row, index) => (
                    <tr key={`${row[0]}-${index}`} className="border-t border-white/5">
                      {row.map((cell, idx) => (
                        <td key={`${cell}-${idx}`} className="py-2 pr-3 text-sm">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section
          className={clsx(
            "mt-6 rounded-2xl border p-4",
            theme === "dark" ? "border-white/5 bg-black/40" : "border-neutral-200 bg-neutral-50"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-neutral-400">Raw payload</p>
              <h2 className="text-lg font-semibold">LLM-visible JSON</h2>
            </div>
            <span className="text-xs text-neutral-400">Kept in sync via Apps SDK</span>
          </div>
          <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-black/60 p-4 text-xs text-emerald-200">
            {JSON.stringify(normalized.payload, null, 2)}
          </pre>
        </section>
      </div>
      <OpenAIDevTools
        mockConfig={{
          toolOutput: {
            ...FALLBACK_WIDGET_STATE,
            result: FALLBACK_WIDGET_STATE.payload
          },
          widgetState: FALLBACK_WIDGET_STATE
        }}
      />
    </SafeArea>
  );
}

function normalizeState(state?: AppsWidgetState): NormalizedSnapshot {
  const workspaceId = state?.workspaceId ?? "ws-demo";
  const toolId = state?.toolId ?? "stripe.metrics";
  const actorId = state?.actorId ?? "user";
  const generatedAt = state?.generatedAt ?? new Date().toISOString();
  const source = state?.source ?? "connector";
  const payload = state?.payload ?? FALLBACK_WIDGET_STATE.payload;

  const metrics: Metric[] = [];
  const payloadObject = !Array.isArray(payload) && typeof payload === "object" ? payload : null;

  if (payloadObject) {
    const currency = (payloadObject as any).currency ?? "USD";
    pushMetric(metrics, "ARR", formatCurrency((payloadObject as any).arr, currency));
    pushMetric(metrics, "MRR", formatCurrency((payloadObject as any).mrr, currency));
    pushMetric(metrics, "Gross Volume", formatCurrency((payloadObject as any).grossVolume, currency));
    pushMetric(metrics, "Net Volume", formatCurrency((payloadObject as any).netVolume, currency));
    pushMetric(metrics, "Total Payments", formatNumber((payloadObject as any).totalPayments));
    pushMetric(
      metrics,
      "Failures",
      formatNumber((payloadObject as any).failedPayments),
      "last sync window"
    );
  }

  const table = extractTable(payload);

  return {
    workspaceId,
    toolId,
    actorId,
    generatedAt,
    source,
    metrics: metrics.slice(0, 4),
    table,
    payload
  };
}

function pushMetric(metrics: Metric[], label: string, value?: string, caption?: string) {
  if (!value) return;
  metrics.push({ label, value, caption });
}

function formatCurrency(value?: number, currency = "USD") {
  if (typeof value !== "number") return undefined;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

function formatNumber(value?: number) {
  if (typeof value !== "number") return undefined;
  return new Intl.NumberFormat("en-US").format(value);
}

function extractTable(payload: unknown): TableDescriptor | undefined {
  if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === "object") {
    const columns = Object.keys(payload[0] as Record<string, unknown>);
    const rows = payload.map((row) =>
      columns.map((column) => formatValue((row as Record<string, unknown>)[column]))
    );
    return {
      columns,
      rows,
      caption: "Streaming records"
    };
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as Record<string, unknown>).latestFailures)
  ) {
    const failures = (payload as Record<string, unknown>).latestFailures as Record<string, unknown>[];
    if (failures.length === 0) {
      return undefined;
    }
    const columns = ["id", "customer", "amount", "failureReason"];
    const rows = failures.map((failure) => [
      String(failure.id ?? failure["name"] ?? "-"),
      String(failure.customer ?? failure["owner"] ?? "-"),
      failure.amount ? `$${failure.amount}` : "-",
      String(failure.failureReason ?? failure["status"] ?? "-")
    ]);
    return {
      columns,
      rows,
      caption: "Latest MCP surfaced incidents"
    };
  }

  return undefined;
}

function formatValue(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null || value === undefined) {
    return "-";
  }
  return JSON.stringify(value);
}
