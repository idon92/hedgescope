import { db } from "@/db";
import { funds, holdings, newsArticles } from "@/db/schema";
import { eq, desc, sql, asc } from "drizzle-orm";

export async function getAllFundsWithSummary() {
  const allFunds = await db.select().from(funds).orderBy(asc(funds.name));

  const fundSummaries = await Promise.all(
    allFunds.map(async (fund) => {
      const fundHoldings = await db
        .select()
        .from(holdings)
        .where(eq(holdings.fundId, fund.id))
        .orderBy(desc(holdings.marketValueThousands));

      const totalMarketValue = fundHoldings.reduce(
        (sum, h) => sum + h.marketValueThousands,
        0
      );
      const top5 = fundHoldings.slice(0, 5);

      return {
        ...fund,
        totalMarketValue,
        positionCount: fundHoldings.length,
        top5Holdings: top5.map((h) => ({
          ticker: h.ticker || h.cusip,
          companyName: h.companyName,
          marketValueThousands: h.marketValueThousands,
          weight:
            totalMarketValue > 0
              ? ((h.marketValueThousands / totalMarketValue) * 100).toFixed(2)
              : "0",
        })),
      };
    })
  );

  return fundSummaries;
}

export async function getFundBySlug(slug: string) {
  const allFunds = await db.select().from(funds);
  const fund = allFunds.find(
    (f) => f.name.toLowerCase().replace(/\s+/g, "-") === slug
  );

  return fund || null;
}

export async function getFundHoldings(fundId: number) {
  return db
    .select()
    .from(holdings)
    .where(eq(holdings.fundId, fundId))
    .orderBy(desc(holdings.marketValueThousands));
}

export async function getCrossFundHoldings() {
  const results = await db
    .select({
      ticker: holdings.ticker,
      companyName: holdings.companyName,
      cusip: holdings.cusip,
      fundCount: sql<number>`count(distinct ${holdings.fundId})`,
      totalShares: sql<number>`sum(${holdings.shares})`,
      totalMarketValue: sql<number>`sum(${holdings.marketValueThousands})`,
    })
    .from(holdings)
    .groupBy(holdings.cusip, holdings.ticker, holdings.companyName)
    .orderBy(sql`count(distinct ${holdings.fundId}) desc, sum(${holdings.marketValueThousands}) desc`);

  return results;
}

export async function getStockHolders(ticker: string) {
  const stockHoldings = await db
    .select({
      fundId: holdings.fundId,
      companyName: holdings.companyName,
      shares: holdings.shares,
      marketValueThousands: holdings.marketValueThousands,
      filingDate: holdings.filingDate,
      optionType: holdings.optionType,
    })
    .from(holdings)
    .where(eq(holdings.ticker, ticker.toUpperCase()));

  // Get fund names
  const fundList = await db.select().from(funds);
  const fundMap = new Map(fundList.map((f) => [f.id, f]));

  return stockHoldings.map((h) => ({
    ...h,
    fundName: fundMap.get(h.fundId)?.name || "Unknown",
  }));
}

export async function searchFundsAndTickers(query: string) {
  if (!query || query.length < 2) return { funds: [], tickers: [] };

  const q = query.toLowerCase();

  const matchedFunds = await db.select().from(funds);
  const filteredFunds = matchedFunds.filter((f) =>
    f.name.toLowerCase().includes(q)
  );

  const matchedHoldings = await db
    .select({
      ticker: holdings.ticker,
      companyName: holdings.companyName,
    })
    .from(holdings)
    .groupBy(holdings.ticker, holdings.companyName);

  const filteredTickers = matchedHoldings.filter(
    (h) =>
      h.ticker?.toLowerCase().includes(q) ||
      h.companyName.toLowerCase().includes(q)
  );

  return {
    funds: filteredFunds.slice(0, 10),
    tickers: filteredTickers.slice(0, 10),
  };
}

// --- News Queries ---

export interface NewsArticle {
  id: number;
  title: string;
  sourceName: string;
  sourceUrl: string;
  publishedDate: Date | null;
  trustTier: number;
  matchedFundIds: string | null;
  matchedTickers: string | null;
  snippet: string | null;
}

export async function getLatestNews(
  limit: number = 20,
  tierFilter?: number
): Promise<NewsArticle[]> {
  let query = db
    .select()
    .from(newsArticles)
    .orderBy(desc(newsArticles.publishedDate))
    .limit(limit);

  if (tierFilter) {
    query = query.where(eq(newsArticles.trustTier, tierFilter)) as typeof query;
  }

  return query;
}

export async function getNewsByFundId(
  fundId: number,
  limit: number = 10
): Promise<NewsArticle[]> {
  // Search for articles that have this fund ID in their matched_fund_ids JSON array
  const allNews = await db
    .select()
    .from(newsArticles)
    .orderBy(desc(newsArticles.publishedDate))
    .limit(200);

  return allNews
    .filter((article) => {
      if (!article.matchedFundIds) return false;
      try {
        const ids: number[] = JSON.parse(article.matchedFundIds);
        return ids.includes(fundId);
      } catch {
        return false;
      }
    })
    .slice(0, limit);
}

export async function getNewsByTicker(
  ticker: string,
  limit: number = 10
): Promise<NewsArticle[]> {
  const allNews = await db
    .select()
    .from(newsArticles)
    .orderBy(desc(newsArticles.publishedDate))
    .limit(200);

  return allNews
    .filter((article) => {
      if (!article.matchedTickers) return false;
      try {
        const tickers: string[] = JSON.parse(article.matchedTickers);
        return tickers.some((t) => t.toUpperCase() === ticker.toUpperCase());
      } catch {
        return false;
      }
    })
    .slice(0, limit);
}
