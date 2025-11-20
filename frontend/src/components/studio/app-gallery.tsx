"use client";

import { motion } from "framer-motion";

interface AppCardProps {
  title: string;
  description: string;
  status: string;
  accent: string;
}

function AppCard({ title, description, status, accent }: AppCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
    >
      <span
        className="absolute inset-x-6 top-6 h-1.5 rounded-full bg-gradient-to-r"
        style={{ backgroundImage: `linear-gradient(90deg, ${accent})` }}
      />
      <div className="space-y-3 pt-8">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{status}</p>
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600">{description}</p>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="rounded-full border border-neutral-200 px-3 py-1 group-hover:border-neutral-300">
            Try it
          </span>
          <span className="truncate">Ready for pilots</span>
        </div>
      </div>
    </motion.div>
  );
}

const appTiles = [
  {
    title: "Command Console",
    description: "Compose prompts, inspect signals, and ship workflows with a single fluid canvas.",
    status: "Live",
    accent: "from-blue-500 to-indigo-600"
  },
  {
    title: "Playground Studio",
    description: "Draft code, sketches, and docs side-by-side before pinning them to a shared canvas.",
    status: "Early access",
    accent: "from-purple-500 to-pink-500"
  },
  {
    title: "Automation Library",
    description: "Run books, retries, and alerts that stay up to date with live analytics.",
    status: "Connected",
    accent: "from-emerald-500 to-teal-500"
  }
];

export function AppGallery() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Apps gallery</p>
          <h2 className="text-2xl font-semibold text-neutral-900">Apps inspired by AI Studio</h2>
        </div>
        <p className="text-sm text-neutral-500">3 production-ready experiences</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {appTiles.map((tile) => (
          <AppCard
            key={tile.title}
            title={tile.title}
            description={tile.description}
            status={tile.status}
            accent={tile.accent}
          />
        ))}
      </div>
    </section>
  );
}