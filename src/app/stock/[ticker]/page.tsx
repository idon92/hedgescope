import type { Metadata } from "next";
import { getStockHolders, getNewsByTicker, getSocialByTicker } from "@/lib/queries";
import StockHoldersTable from "./StockHoldersTable";
import NewsFeed from "@/components/NewsFeed";
import SocialFeed from "@/components/SocialFeed";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface Props {
  params: { ticker: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = params.ticker.toUpperCase();
  return {
    title: `${ticker} — Hedge Fund Holders`,
    description: `See which tracked hedge funds hold ${ticker}, with position sizes, portfolio weights, and related news.`,
  };
}

export default async function StockDetailPage({ params }: Props) {
  const ticker = params.ticker.toUpperCase();
  const [holders, tickerNews, tickerSocial] = await Promise.all([
    getStockHolders(ticker),
    getNewsByTicker(ticker, 10),
    getSocialByTicker(ticker, 10),
  ]);

  return (
    <div>
      <div className="mb-8">
        <a
          href="/holdings"
          className="text-sm font-mono text-gray-500 hover:text-accent transition-colors"
        >
          &larr; All Holdings
        </a>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white mt-2 mb-1">
          <span className="text-accent">{ticker}</span>
        </h1>
        <p className="text-sm text-gray-400 font-mono">
          {holders.length > 0
            ? `Held by ${holders.length} tracked fund${holders.length !== 1 ? "s" : ""}`
            : "Not currently held by any tracked funds"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockHoldersTable holders={holders} />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <NewsFeed
            articles={tickerNews}
            showFilter={false}
            title={`${ticker} News`}
          />
          <SocialFeed
            posts={tickerSocial}
            title={`${ticker} Social`}
          />
        </div>
      </div>
    </div>
  );
}
