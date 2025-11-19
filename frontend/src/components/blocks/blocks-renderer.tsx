import { MessageBlock } from "@/data/mock";

export function BlocksRenderer({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "metrics") {
          return (
            <div key={index} className="grid grid-cols-3 gap-3">
              {block.metrics.map((metric) => (
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
          return (
            <div key={index} className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-400">
                  <tr>
                    {block.columns.map((col) => (
                      <th key={col} className="px-4 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
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
          return (
            <div key={index} className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
              <p className="font-semibold text-red-300">{block.title}</p>
              <p className="text-red-200">{block.body}</p>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
