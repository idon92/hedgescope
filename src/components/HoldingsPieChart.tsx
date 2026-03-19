"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatMarketValue } from "@/lib/format";
import type { CategoryBreakdown } from "@/lib/holdings-categories";

interface HoldingsPieChartProps {
  bySector: CategoryBreakdown[];
  byCap: CategoryBreakdown[];
  byGeography: CategoryBreakdown[];
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  Healthcare: "#22c55e",
  Financials: "#eab308",
  "Consumer Discretionary": "#f97316",
  "Consumer Staples": "#84cc16",
  Energy: "#ef4444",
  Industrials: "#8b5cf6",
  "Communication Services": "#06b6d4",
  "Real Estate": "#ec4899",
  Materials: "#a78bfa",
  Utilities: "#14b8a6",
  "ETF/Index": "#6366f1",
  Other: "#6b7280",
};

const CAP_COLORS: Record<string, string> = {
  "Mega Cap": "#3b82f6",
  "Large Cap": "#22c55e",
  "Mid Cap": "#eab308",
  "Small Cap": "#f97316",
  "Micro Cap": "#ef4444",
};

const GEO_COLORS: Record<string, string> = {
  "North America": "#3b82f6",
  Europe: "#22c55e",
  "Asia Pacific": "#eab308",
  "Emerging Markets": "#f97316",
  Other: "#6b7280",
};

type ChartTab = "sector" | "cap" | "geography";

function getColor(name: string, tab: ChartTab): string {
  if (tab === "sector") return SECTOR_COLORS[name] || "#6b7280";
  if (tab === "cap") return CAP_COLORS[name] || "#6b7280";
  return GEO_COLORS[name] || "#6b7280";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-2 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm font-mono text-white">{d.name}</p>
      <p className="text-xs font-mono text-gray-400">
        {formatMarketValue(d.value)} &middot; {d.count} positions
      </p>
      <p className="text-xs font-mono text-accent">{d.pct}%</p>
    </div>
  );
}

export default function HoldingsPieChart({
  bySector,
  byCap,
  byGeography,
}: HoldingsPieChartProps) {
  const [tab, setTab] = useState<ChartTab>("sector");

  const datasets: Record<ChartTab, CategoryBreakdown[]> = {
    sector: bySector,
    cap: byCap,
    geography: byGeography,
  };

  const labels: Record<ChartTab, string> = {
    sector: "Sector",
    cap: "Market Cap",
    geography: "Geography",
  };

  const data = datasets[tab];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data
    .filter((d) => d.value > 0)
    .map((d) => ({
      ...d,
      pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0",
    }));

  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-sans font-semibold text-white">
          Holdings Breakdown
        </h3>
        <div className="flex gap-1">
          {(Object.keys(labels) as ChartTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                tab === t
                  ? "bg-accent/20 text-accent"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {labels[t]}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-gray-500 text-sm font-mono py-8 text-center">
          No data to display
        </p>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  stroke="#0a0a0f"
                  strokeWidth={2}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getColor(entry.name, tab)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-1.5">
            {chartData.slice(0, 8).map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs font-mono">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: getColor(d.name, tab) }}
                />
                <span className="text-gray-300 truncate flex-1">{d.name}</span>
                <span className="text-gray-500">{d.count}</span>
                <span className="text-gray-400 w-12 text-right">{d.pct}%</span>
              </div>
            ))}
            {chartData.length > 8 && (
              <p className="text-[10px] text-gray-600 font-mono">
                +{chartData.length - 8} more categories
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
