"use client";

import SortableTable from "@/components/SortableTable";
import { formatMarketValue, formatShares, formatDate, fundSlug } from "@/lib/format";

interface Holder {
  fundName: string;
  fundId: number;
  shares: number;
  marketValueThousands: number;
  filingDate: Date;
  optionType: string | null;
}

export default function StockHoldersTable({ holders }: { holders: Holder[] }) {
  const columns = [
    {
      key: "fund",
      header: "Fund",
      render: (row: Holder) => (
        <a
          href={`/fund/${fundSlug(row.fundName)}`}
          className="text-accent hover:underline"
        >
          {row.fundName}
        </a>
      ),
      sortValue: (row: Holder) => row.fundName,
      className: "sticky left-0 bg-[#0a0a0f] z-10",
    },
    {
      key: "shares",
      header: "Shares",
      render: (row: Holder) => (
        <span className="text-gray-200">{formatShares(row.shares)}</span>
      ),
      sortValue: (row: Holder) => row.shares,
    },
    {
      key: "value",
      header: "Market Value",
      render: (row: Holder) => (
        <span className="text-gray-200">
          {formatMarketValue(row.marketValueThousands)}
        </span>
      ),
      sortValue: (row: Holder) => row.marketValueThousands,
    },
    {
      key: "type",
      header: "Type",
      render: (row: Holder) =>
        row.optionType ? (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
            {row.optionType}
          </span>
        ) : (
          <span className="text-gray-600">SH</span>
        ),
    },
    {
      key: "filing",
      header: "Filing Date",
      render: (row: Holder) => (
        <span className="text-gray-400 text-xs">
          {formatDate(row.filingDate)}
        </span>
      ),
      sortValue: (row: Holder) => new Date(row.filingDate).getTime(),
    },
  ];

  return (
    <SortableTable
      data={holders}
      columns={columns}
      emptyMessage="No tracked funds currently hold this stock."
    />
  );
}
