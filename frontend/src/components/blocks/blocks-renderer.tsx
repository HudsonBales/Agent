import { MessageBlock } from "@/data/types";

export function BlocksRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "metrics") {
          const metricsBlock = block as Extract<typeof block, { type: "metrics" }>;
          return (
            <div key={index} className="grid grid-cols-3 gap-3">
              {metricsBlock.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <p className="text-xs uppercase text-neutral-400">{metric.label}</p>
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  {metric.delta && <p className="text-xs text-emerald-400">{metric.delta}</p>}
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "table") {
          const tableBlock = block as Extract<typeof block, { type: "table" }>;
          return (
            <div key={index} className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
                  <tr>
                    {tableBlock.columns.map((col) => (
                      <th key={col} className="px-4 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableBlock.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="odd:bg-white/0 even:bg-white/5">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-white/90">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "error") {
          const errorBlock = block as Extract<typeof block, { type: "error" }>;
          return (
            <div key={index} className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
              <p className="font-semibold text-red-300">{errorBlock.title}</p>
              <p className="text-red-200">{errorBlock.body}</p>
            </div>
          );
        }

        if (block.type === "plan" && block.data && typeof block.data === "object") {
          const plan = block.data as { goal?: string; steps?: { id?: string; title?: string; description?: string }[] };
          return (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-400">{block.title ?? "Agent plan"}</p>
              <p className="mt-2 text-lg font-semibold text-white">{plan.goal}</p>
              <ol className="mt-4 space-y-3 text-sm text-neutral-200">
                {plan.steps?.map((step) => (
                  <li key={step.id ?? step.title} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-neutral-400">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          );
        }

        if (block.type === "ui_schema" && block.data && typeof block.data === "object") {
          return (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-400">{block.title ?? "Generated layout"}</p>
              <pre className="mt-3 overflow-x-auto text-xs text-neutral-300">
                {JSON.stringify(block.data, null, 2)}
              </pre>
            </div>
          );
        }

        return (
          <div key={index} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-neutral-300">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{block.type}</p>
            <pre className="mt-2 overflow-x-auto">{JSON.stringify(block, null, 2)}</pre>
          </div>
        );
      })}
    </div>
  );
}
