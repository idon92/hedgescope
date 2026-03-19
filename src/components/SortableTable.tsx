"use client";

import { useState, useMemo, useCallback } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
  className?: string;
}

interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

export default function SortableTable<T>({
  data,
  columns,
  emptyMessage = "No data available",
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [focusedRow, setFocusedRow] = useState<number>(-1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;

    return [...data].sort((a, b) => {
      const aVal = col.sortValue!(a);
      const bVal = col.sortValue!(b);
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir, columns]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const handleTableKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedRow((prev) => Math.min(prev + 1, sorted.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedRow(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedRow(sorted.length - 1);
      }
    },
    [sorted.length]
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 font-mono text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" onKeyDown={handleTableKeyDown}>
      <table
        className="w-full text-sm font-mono"
        role="grid"
        aria-label="Data table"
      >
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-3 text-gray-400 font-medium sort-header ${col.className || ""}`}
                onClick={() => col.sortValue && handleSort(col.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (col.sortValue) handleSort(col.key);
                  }
                }}
                tabIndex={col.sortValue ? 0 : -1}
                role="columnheader"
                aria-sort={
                  sortKey === col.key
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                {col.header}
                {col.sortValue && (
                  <span
                    className={`ml-1 ${sortKey === col.key ? "text-accent" : "text-gray-700"}`}
                    aria-hidden="true"
                  >
                    {sortKey === col.key
                      ? sortDir === "asc"
                        ? "\u25B2"
                        : "\u25BC"
                      : "\u25BC"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-800/50 transition-colors ${
                focusedRow === i
                  ? "bg-surface-2 ring-1 ring-accent/30"
                  : "hover:bg-surface"
              }`}
              tabIndex={focusedRow === i ? 0 : -1}
              onFocus={() => setFocusedRow(i)}
              role="row"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-3 ${col.className || ""}`}
                  role="gridcell"
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
