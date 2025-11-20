"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  isActive: boolean;
  onClick: () => void;
}

function MetricCard({ label, value, delta, isActive, onClick }: MetricCardProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        isActive 
          ? "border-blue-500 bg-blue-50 text-blue-900" 
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {delta && (
        <p className={`text-xs ${delta.startsWith('+') || delta.startsWith('↑') ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta} vs last week
        </p>
      )}
    </button>
  );
}

interface TrendDataPoint {
  label: string;
  value: number;
}

interface DataVisualizationProps {
  metrics: Array<{ label: string; value: string; delta?: string }>;
  trendData: TrendDataPoint[];
}

export function DataVisualization({ metrics, trendData }: DataVisualizationProps) {
  const [activeMetric, setActiveMetric] = useState(metrics[0]?.label ?? "MRR");

  // Find max value for scaling the chart
  const maxValue = Math.max(...trendData.map(point => point.value), 1);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            isActive={activeMetric === metric.label}
            onClick={() => setActiveMetric(metric.label)}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Insight</p>
            <h3 className="text-lg font-semibold text-neutral-900">{activeMetric} focus</h3>
          </div>
          <span className="text-xs text-neutral-500">Updated live</span>
        </div>
        
        <div className="mt-4">
          <div className="flex h-40 items-end justify-between gap-2">
            {trendData.map((point, index) => (
              <div key={index} className="flex flex-1 flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(point.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400"
                />
                <span className="mt-2 text-xs text-neutral-500">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            <p>Fastest movement inside Growth tier. Trial-to-paid dropped 14% WoW.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
              Retry invoices
            </span>
            <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
              Notify billing
            </span>
            <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
              Reconcile logs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}