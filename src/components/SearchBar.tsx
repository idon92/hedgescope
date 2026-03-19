"use client";

import { useState, useEffect, useRef } from "react";
import { fundSlug } from "@/lib/format";

interface SearchResult {
  funds: Array<{ id: number; name: string }>;
  tickers: Array<{ ticker: string | null; companyName: string }>;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
          setOpen(true);
        }
      } catch {}
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search funds or tickers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
        className="w-full bg-surface border border-gray-800 rounded-lg px-4 py-2 text-sm font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
        aria-label="Search funds and tickers"
      />
      {open && results && (results.funds.length > 0 || results.tickers.length > 0) && (
        <div className="absolute top-full mt-1 w-full bg-surface-2 border border-gray-800 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.funds.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 pb-1 font-mono">FUNDS</div>
              {results.funds.map((f) => (
                <a
                  key={f.id}
                  href={`/fund/${fundSlug(f.name)}`}
                  className="block px-2 py-1.5 text-sm text-gray-300 hover:bg-surface hover:text-white rounded transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {f.name}
                </a>
              ))}
            </div>
          )}
          {results.tickers.length > 0 && (
            <div className="p-2 border-t border-gray-800">
              <div className="text-xs text-gray-500 px-2 pb-1 font-mono">STOCKS</div>
              {results.tickers.map((t, i) => (
                <a
                  key={i}
                  href={`/stock/${t.ticker || "unknown"}`}
                  className="block px-2 py-1.5 text-sm text-gray-300 hover:bg-surface hover:text-white rounded transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-accent font-mono">{t.ticker || "—"}</span>{" "}
                  <span className="text-gray-500">{t.companyName}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
