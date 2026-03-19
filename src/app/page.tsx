import { Suspense } from "react";
import { getAllFundsWithSummary, getLatestNews } from "@/lib/queries";
import { formatMarketValue, formatDate, fundSlug } from "@/lib/format";
import SearchBar from "@/components/SearchBar";
import EmailGate from "@/components/EmailGate";
import NewsFeed from "@/components/NewsFeed";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

async function FundGrid() {
  const funds = await getAllFundsWithSummary();

  if (funds.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-mono text-sm mb-4">
          No fund data yet. Sync filings to get started.
        </p>
        <p className="text-gray-600 font-mono text-xs">
          POST /api/sync-filings to pull data from SEC EDGAR
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {funds.map((fund) => (
        <a
          key={fund.id}
          href={`/fund/${fundSlug(fund.name)}`}
          className="bg-surface border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
        >
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-sans font-semibold text-white group-hover:text-accent transition-colors">
              {fund.name}
            </h2>
            <span className="text-xs font-mono text-gray-500">
              {formatDate(fund.lastFilingDate)}
            </span>
          </div>
          <div className="flex gap-4 mb-4 text-sm font-mono">
            <div>
              <span className="text-gray-500">AUM </span>
              <span className="text-white">
                {formatMarketValue(fund.totalMarketValue)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Positions </span>
              <span className="text-white">{fund.positionCount}</span>
            </div>
          </div>
          {fund.top5Holdings.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 font-mono mb-1">
                TOP HOLDINGS
              </div>
              {fund.top5Holdings.map((h, i) => (
                <div
                  key={i}
                  className="flex justify-between text-xs font-mono"
                >
                  <span className="text-accent">{h.ticker}</span>
                  <span className="text-gray-400">{h.weight}%</span>
                </div>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}

async function NewsSection() {
  const news = await getLatestNews(20);
  return <NewsFeed articles={news} />;
}

export default function HomePage() {
  return (
    <>
      <EmailGate />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white mb-2">
          Hedge Fund Holdings
        </h1>
        <p className="text-sm text-gray-400 font-mono mb-6">
          13F filings from SEC EDGAR, parsed and tracked quarterly
        </p>
        <SearchBar />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <FundGrid />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-800/50 rounded-lg" />
                ))}
              </div>
            }
          >
            <NewsSection />
          </Suspense>
        </div>
      </div>
    </>
  );
}
