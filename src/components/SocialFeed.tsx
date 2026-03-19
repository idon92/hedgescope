"use client";

import { useState } from "react";
import TrustBadge from "./TrustBadge";
import { formatDate } from "@/lib/format";

interface SocialPostItem {
  id: number;
  platform: string;
  authorHandle: string | null;
  content: string;
  sourceUrl: string | null;
  publishedDate: Date | string | null;
  matchedTickers: string | null;
}

interface SocialFeedProps {
  posts: SocialPostItem[];
  title?: string;
}

const PLATFORM_ICONS: Record<string, { label: string; color: string }> = {
  reddit: { label: "Reddit", color: "text-orange-400" },
  stocktwits: { label: "StockTwits", color: "text-green-400" },
  twitter: { label: "X/Twitter", color: "text-sky-400" },
  manual: { label: "Intel", color: "text-purple-400" },
};

export default function SocialFeed({
  posts,
  title = "Social Chatter",
}: SocialFeedProps) {
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  const platforms = Array.from(new Set(posts.map((p) => p.platform)));
  const filtered = platformFilter
    ? posts.filter((p) => p.platform === platformFilter)
    : posts;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-sans font-semibold text-white">{title}</h2>
        {platforms.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setPlatformFilter(null)}
              className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                platformFilter === null
                  ? "bg-accent/20 text-accent"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              All
            </button>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() =>
                  setPlatformFilter(p === platformFilter ? null : p)
                }
                className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                  platformFilter === p
                    ? "bg-accent/20 text-accent"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {PLATFORM_ICONS[p]?.label || p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-l-2 border-red-500/20 pl-4 mb-3">
        <p className="text-[10px] font-mono text-red-400/60">
          TIER 5 — Unverified social content. Do not act on this information alone.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm font-mono py-8 text-center">
          No social posts yet. Sync social data to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => {
            const platformInfo =
              PLATFORM_ICONS[post.platform] || PLATFORM_ICONS.manual;
            let tickers: string[] = [];
            try {
              tickers = post.matchedTickers
                ? JSON.parse(post.matchedTickers)
                : [];
            } catch {}

            return (
              <div
                key={post.id}
                className="bg-surface border border-gray-800/50 rounded-lg p-3 hover:border-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <TrustBadge tier={5} />
                  <span
                    className={`text-xs font-mono font-semibold ${platformInfo.color}`}
                  >
                    {platformInfo.label}
                  </span>
                  {post.authorHandle && (
                    <span className="text-xs font-mono text-gray-500">
                      @{post.authorHandle}
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-600 ml-auto whitespace-nowrap">
                    {formatDate(post.publishedDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-snug line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {tickers.slice(0, 5).map((t) => (
                    <a
                      key={t}
                      href={`/stock/${t}`}
                      className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded hover:bg-accent/20 transition-colors"
                    >
                      ${t}
                    </a>
                  ))}
                  {post.sourceUrl && (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-gray-500 hover:text-gray-300 ml-auto transition-colors"
                    >
                      source &rarr;
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
