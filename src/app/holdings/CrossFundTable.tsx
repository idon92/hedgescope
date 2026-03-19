"use client";

import SortableTable from "@/components/SortableTable";
import { formatMarketValue, formatShares } from "@/lib/format";

interface CrossHolding {
  ticker: string | null;
  companyName: string;
  cusip: string;
  fundCount: number;
  totalShares: number;
  totalMarketValue: number;
}

export default function CrossFundTable({
  holdings,
}: {
  holdings: CrossHolding[];
}) {
  const columns = [
    {
      key: "ticker",
      header: "Ticker",
      render: (row: CrossHolding) => (
        <a
          href={`/stock/${row.ticker || row.cusip}`}
          className="text-accent hover:underline font-mono"
        >
          {row.ticker || row.cusip}
        </a>
      ),
      sortValue: (row: CrossHolding) => row.ticker || row.cusip,
      className: "sticky left-0 bg-[#0a0a0f] z-10",
    },
    {
      key: "company",
      header: "Company",
      render: (row: CrossHolding) => (
        <span className="text-gray-300">{row.companyName}</span>
      ),
      sortValue: (row: CrossHolding) => row.companyName,
    },
    {
      key: "funds",
      header: "# Funds",
      render: (row: CrossHolding) => (
        <span className="text-white font-semibold">{row.fundCount}</span>
      ),
      sortValue: (row: CrossHolding) => row.fundCount,
    },
    {
      key: "shares",
      header: "Total Shares",
      render: (row: CrossHolding) => (
        <span className="text-gray-200">{formatShares(row.totalShares)}</span>
      ),
      sortValue: (row: CrossHolding) => row.totalShares,
    },
    {
      key: "value",
      header: "Total Value",
      render: (row: CrossHolding) => (
        <span className="text-gray-200">
          {formatMarketValue(row.totalMarketValue)}
        </span>
      ),
      sortValue: (row: CrossHolding) => row.totalMarketValue,
    },
  ];

  return (
    <SortableTable
      data={holdings}
      columns={columns}
      emptyMessage="No cross-fund holdings data yet. Sync filings first."
    />
  );
}
