"use client";

import { useState } from "react";
import TrustBadge from "./TrustBadge";
import { formatDate } from "@/lib/format";

interface NewsItem {
  id: number;
  title: string;
  sourceName: string;
  sourceUrl: string;
  publishedDate: Date | string | null;
  trustTier: number;
  matchedTickers: string | null;
  snippet: string | null;
}

interface NewsFeedProps {
  articles: NewsItem[];
  showFilter?: boolean;
  title?: string;
}

export default function NewsFeed({
  articles,
  showFilter = true,
  title = "Latest News",
}: NewsFeedProps) {
  const [tierFilter, setTierFilter] = useState<number | null>(null);

  const filtered = tierFilter
    ? articles.filter((a) => a.trustTier === tierFilter)
    : articles;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-sans font-semibold text-white">{title}</h2>
        {showFilter && (
          <div className="flex gap-1">
            <button
              onClick={() => setTierFilter(null)}
              className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                tierFilter === null
                  ? "bg-accent/20 text-accent"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier === tierFilter ? null : tier)}
                className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                  tierFilter === tier
                    ? "bg-accent/20 text-accent"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                T{tier}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm font-mono py-8 text-center">
          No news articles yet. Sync news to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => {
            let tickers: string[] = [];
            try {
              tickers = article.matchedTickers
                ? JSON.parse(article.matchedTickers)
                : [];
            } catch {}

            return (
              <a
                key={article.id}
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors group"
              >
                <div className="flex items-start gap-2 mb-1.5">
                  <TrustBadge tier={article.trustTier} />
                  <span className="text-xs font-mono text-gray-500">
                    {article.sourceName}
                  </span>
                  <span className="text-xs font-mono text-gray-600 ml-auto whitespace-nowrap">
                    {formatDate(article.publishedDate)}
                  </span>
                </div>
                <h3 className="text-sm text-gray-200 group-hover:text-white transition-colors leading-snug mb-1">
                  {article.title}
                </h3>
                {article.snippet && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {article.snippet}
                  </p>
                )}
                {tickers.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {tickers.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
