"use client";

import { formatMarketValue, formatShares, fundSlug } from "@/lib/format";
import type { PositionChange } from "@/lib/queries";

interface ShiftItem extends PositionChange {
  fundName?: string;
  fundId?: number;
}

interface PositionShiftsProps {
  shifts: ShiftItem[];
  showFund?: boolean;
  title?: string;
}

function StatusBadge({ status }: { status: PositionChange["status"] }) {
  const styles: Record<string, string> = {
    new: "bg-positive/20 text-positive border-positive/30",
    exited: "bg-negative/20 text-negative border-negative/30",
    increased: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    decreased: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    unchanged: "bg-gray-700/50 text-gray-500 border-gray-600/30",
  };

  const labels: Record<string, string> = {
    new: "NEW",
    exited: "EXIT",
    increased: "UP",
    decreased: "DOWN",
    unchanged: "FLAT",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function PositionShifts({
  shifts,
  showFund = false,
  title = "Recent Position Shifts",
}: PositionShiftsProps) {
  if (shifts.length === 0) {
    return (
      <div className="bg-surface border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-sans font-semibold text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-500 text-sm font-mono py-4 text-center">
          No position changes detected. Need at least 2 quarters of data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-sans font-semibold text-white mb-3">
        {title}
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {shifts.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0"
          >
            <StatusBadge status={s.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={`/stock/${s.ticker || s.cusip}`}
                  className="text-sm font-mono text-accent hover:underline"
                >
                  {s.ticker || s.cusip}
                </a>
                {showFund && s.fundName && (
                  <a
                    href={`/fund/${fundSlug(s.fundName)}`}
                    className="text-[10px] font-mono text-gray-500 hover:text-gray-300 truncate"
                  >
                    {s.fundName}
                  </a>
                )}
              </div>
              <p className="text-xs font-mono text-gray-500 truncate">
                {s.companyName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div
                className={`text-xs font-mono font-semibold ${
                  s.shareDelta > 0
                    ? "text-positive"
                    : s.shareDelta < 0
                      ? "text-negative"
                      : "text-gray-500"
                }`}
              >
                {s.shareDelta > 0 ? "+" : ""}
                {formatShares(s.shareDelta)}
              </div>
              <div className="text-[10px] font-mono text-gray-500">
                {s.status === "new" || s.status === "exited"
                  ? formatMarketValue(Math.abs(s.valueDelta))
                  : `${s.shareChangePct > 0 ? "+" : ""}${s.shareChangePct.toFixed(1)}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
