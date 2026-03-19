import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFundBySlug,
  getFundHoldings,
  getNewsByFundId,
  getFundPositionChanges,
} from "@/lib/queries";
import { formatMarketValue, formatDate } from "@/lib/format";
import {
  categorizeHoldings,
  getSector,
  getCapCategory,
  getGeography,
} from "@/lib/holdings-categories";
import NewsFeed from "@/components/NewsFeed";
import PositionShifts from "@/components/PositionShifts";
import FundDashboard from "./FundDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fund = await getFundBySlug(params.slug);
  if (!fund) return { title: "Fund Not Found" };
  return {
    title: `${fund.name} — 13F Holdings`,
    description: `View ${fund.name}'s latest 13F holdings, portfolio composition, and related news on HedgeScope.`,
  };
}

export default async function FundDetailPage({ params }: Props) {
  const fund = await getFundBySlug(params.slug);

  if (!fund) {
    notFound();
  }

  const [holdings, fundNews, positionChanges] = await Promise.all([
    getFundHoldings(fund.id),
    getNewsByFundId(fund.id, 10),
    getFundPositionChanges(fund.id),
  ]);

  const totalMarketValue = holdings.reduce(
    (sum, h) => sum + h.marketValueThousands,
    0
  );

  const holdingsWithCategories = holdings.map((h) => ({
    ...h,
    weight:
      totalMarketValue > 0
        ? (h.marketValueThousands / totalMarketValue) * 100
        : 0,
    sector: getSector(h.ticker, h.companyName),
    capCategory: getCapCategory(h.marketValueThousands),
    geography: getGeography(h.ticker),
  }));

  const categories = categorizeHoldings(holdings);

  return (
    <div>
      <div className="mb-8">
        <a
          href="/"
          className="text-sm font-mono text-gray-500 hover:text-accent transition-colors"
        >
          &larr; All Funds
        </a>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white mt-2 mb-1">
          {fund.name}
        </h1>
        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-mono text-gray-400">
          <span>CIK: {fund.cik}</span>
          <span>Last Filing: {formatDate(fund.lastFilingDate)}</span>
          <span>AUM: {formatMarketValue(totalMarketValue)}</span>
          <span>{holdings.length} positions</span>
        </div>
      </div>

      {/* Position Shifts */}
      <div className="mb-8">
        <PositionShifts
          shifts={positionChanges.slice(0, 15)}
          title="Quarter-over-Quarter Changes"
        />
      </div>

      {/* Pie Chart (with tab selector) + Holdings Table (category column synced to tab) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FundDashboard
            holdings={holdingsWithCategories}
            categories={categories}
          />
        </div>
        <div className="lg:col-span-1">
          <NewsFeed
            articles={fundNews}
            showFilter={false}
            title="Recent News"
          />
        </div>
      </div>
    </div>
  );
}
