"use client";

import SortableTable from "@/components/SortableTable";
import { formatMarketValue, formatShares } from "@/lib/format";
import type { CategoryTab } from "./FundDashboard";

interface HoldingRow {
  ticker: string | null;
  companyName: string;
  shares: number;
  marketValueThousands: number;
  weight: number;
  optionType: string | null;
  cusip: string;
  sector: string;
  capCategory: string;
  geography: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  // Sectors
  Technology: "text-blue-400",
  Healthcare: "text-green-400",
  Financials: "text-yellow-400",
  "Consumer Discretionary": "text-orange-400",
  "Consumer Staples": "text-lime-400",
  Energy: "text-red-400",
  Industrials: "text-purple-400",
  "Communication Services": "text-cyan-400",
  "Real Estate": "text-pink-400",
  Materials: "text-violet-400",
  Utilities: "text-teal-400",
  "ETF/Index": "text-indigo-400",
  // Cap
  "Mega Cap": "text-blue-400",
  "Large Cap": "text-green-400",
  "Mid Cap": "text-yellow-400",
  "Small Cap": "text-orange-400",
  "Micro Cap": "text-red-400",
  // Geo
  "North America": "text-blue-400",
  Europe: "text-green-400",
  "Asia Pacific": "text-yellow-400",
  "Emerging Markets": "text-orange-400",
};

function getCategoryValue(row: HoldingRow, tab: CategoryTab): string {
  if (tab === "sector") return row.sector;
  if (tab === "cap") return row.capCategory;
  return row.geography;
}

const TAB_HEADERS: Record<CategoryTab, string> = {
  sector: "Sector",
  cap: "Cap Size",
  geography: "Region",
};

export default function FundHoldingsTable({
  holdings,
  categoryTab = "sector",
}: {
  holdings: HoldingRow[];
  categoryTab?: CategoryTab;
}) {
  const columns = [
    {
      key: "ticker",
      header: "Ticker",
      render: (row: HoldingRow) => (
        <a
          href={`/stock/${row.ticker || row.cusip}`}
          className="text-accent hover:underline"
        >
          {row.ticker || row.cusip}
        </a>
      ),
      sortValue: (row: HoldingRow) => row.ticker || row.cusip,
      className: "sticky left-0 bg-[#0a0a0f] z-10",
    },
    {
      key: "company",
      header: "Company",
      render: (row: HoldingRow) => (
        <span className="text-gray-300">{row.companyName}</span>
      ),
      sortValue: (row: HoldingRow) => row.companyName,
    },
    {
      key: "category",
      header: TAB_HEADERS[categoryTab],
      render: (row: HoldingRow) => {
        const val = getCategoryValue(row, categoryTab);
        const color = CATEGORY_COLORS[val] || "text-gray-400";
        return (
          <span className={`text-xs font-mono ${color}`}>
            {val}
          </span>
        );
      },
      sortValue: (row: HoldingRow) => getCategoryValue(row, categoryTab),
    },
    {
      key: "shares",
      header: "Shares",
      render: (row: HoldingRow) => (
        <span className="text-gray-200">{formatShares(row.shares)}</span>
      ),
      sortValue: (row: HoldingRow) => row.shares,
    },
    {
      key: "value",
      header: "Market Value",
      render: (row: HoldingRow) => (
        <span className="text-gray-200">
          {formatMarketValue(row.marketValueThousands)}
        </span>
      ),
      sortValue: (row: HoldingRow) => row.marketValueThousands,
    },
    {
      key: "weight",
      header: "% Portfolio",
      render: (row: HoldingRow) => (
        <span className="text-gray-200">{row.weight.toFixed(2)}%</span>
      ),
      sortValue: (row: HoldingRow) => row.weight,
    },
    {
      key: "type",
      header: "Type",
      render: (row: HoldingRow) =>
        row.optionType ? (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
            {row.optionType}
          </span>
        ) : (
          <span className="text-gray-600">SH</span>
        ),
      sortValue: (row: HoldingRow) => row.optionType || "SH",
    },
  ];

  return (
    <SortableTable
      data={holdings}
      columns={columns}
      emptyMessage="No holdings data for this fund yet."
    />
  );
}
