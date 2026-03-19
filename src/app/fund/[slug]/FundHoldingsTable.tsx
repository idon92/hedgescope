"use client";

import SortableTable from "@/components/SortableTable";
import { formatMarketValue, formatShares } from "@/lib/format";

interface HoldingRow {
  ticker: string | null;
  companyName: string;
  shares: number;
  marketValueThousands: number;
  weight: number;
  optionType: string | null;
  cusip: string;
}

export default function FundHoldingsTable({
  holdings,
}: {
  holdings: HoldingRow[];
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
