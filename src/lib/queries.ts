import { db } from "@/db";
import { funds, holdings, newsArticles, socialPosts } from "@/db/schema";
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

export async function getFundHoldings(fundId: number, filingDate?: Date) {
  const allHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.fundId, fundId))
    .orderBy(desc(holdings.marketValueThousands));

  if (!filingDate) {
    // Return only the latest quarter's holdings
    const dates = Array.from(new Set(allHoldings.map((h) => h.filingDate.getTime())));
    if (dates.length === 0) return [];
    const latestDate = Math.max(...dates);
    return allHoldings.filter((h) => h.filingDate.getTime() === latestDate);
  }

  return allHoldings.filter((h) => h.filingDate.getTime() === filingDate.getTime());
}

export async function getFundFilingDates(fundId: number): Promise<Date[]> {
  const allHoldings = await db
    .select({ filingDate: holdings.filingDate })
    .from(holdings)
    .where(eq(holdings.fundId, fundId))
    .groupBy(holdings.filingDate)
    .orderBy(desc(holdings.filingDate));

  return allHoldings.map((h) => h.filingDate);
}

export interface PositionChange {
  ticker: string | null;
  companyName: string;
  cusip: string;
  currentShares: number;
  previousShares: number;
  shareDelta: number;
  shareChangePct: number;
  currentValue: number;
  previousValue: number;
  valueDelta: number;
  status: "new" | "exited" | "increased" | "decreased" | "unchanged";
}

export async function getFundPositionChanges(fundId: number): Promise<PositionChange[]> {
  const allHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.fundId, fundId));

  // Find the two most recent filing dates
  const dates = Array.from(new Set(allHoldings.map((h) => h.filingDate.getTime()))).sort(
    (a, b) => b - a
  );

  if (dates.length < 2) return [];

  const currentDate = dates[0];
  const previousDate = dates[1];

  const current = allHoldings.filter((h) => h.filingDate.getTime() === currentDate);
  const previous = allHoldings.filter((h) => h.filingDate.getTime() === previousDate);

  const prevMap = new Map(previous.map((h) => [h.cusip, h]));
  const currMap = new Map(current.map((h) => [h.cusip, h]));

  const changes: PositionChange[] = [];

  // Current holdings — check for new, increased, decreased
  for (const h of current) {
    const prev = prevMap.get(h.cusip);
    if (!prev) {
      changes.push({
        ticker: h.ticker,
        companyName: h.companyName,
        cusip: h.cusip,
        currentShares: h.shares,
        previousShares: 0,
        shareDelta: h.shares,
        shareChangePct: 100,
        currentValue: h.marketValueThousands,
        previousValue: 0,
        valueDelta: h.marketValueThousands,
        status: "new",
      });
    } else {
      const shareDelta = h.shares - prev.shares;
      const pct = prev.shares > 0 ? (shareDelta / prev.shares) * 100 : 0;
      const status = shareDelta > 0 ? "increased" : shareDelta < 0 ? "decreased" : "unchanged";
      changes.push({
        ticker: h.ticker,
        companyName: h.companyName,
        cusip: h.cusip,
        currentShares: h.shares,
        previousShares: prev.shares,
        shareDelta,
        shareChangePct: pct,
        currentValue: h.marketValueThousands,
        previousValue: prev.marketValueThousands,
        valueDelta: h.marketValueThousands - prev.marketValueThousands,
        status,
      });
    }
  }

  // Exited positions
  for (const h of previous) {
    if (!currMap.has(h.cusip)) {
      changes.push({
        ticker: h.ticker,
        companyName: h.companyName,
        cusip: h.cusip,
        currentShares: 0,
        previousShares: h.shares,
        shareDelta: -h.shares,
        shareChangePct: -100,
        currentValue: 0,
        previousValue: h.marketValueThousands,
        valueDelta: -h.marketValueThousands,
        status: "exited",
      });
    }
  }

  // Sort by absolute value change
  return changes.sort((a, b) => Math.abs(b.valueDelta) - Math.abs(a.valueDelta));
}

export async function getRecentShiftsAcrossFunds(): Promise<
  Array<PositionChange & { fundName: string; fundId: number }>
> {
  const allFunds = await db.select().from(funds);
  const allShifts: Array<PositionChange & { fundName: string; fundId: number }> = [];

  for (const fund of allFunds) {
    const changes = await getFundPositionChanges(fund.id);
    // Take the top notable shifts (new, exited, or big % changes)
    const notable = changes.filter(
      (c) => c.status === "new" || c.status === "exited" || Math.abs(c.shareChangePct) > 20
    );
    for (const c of notable.slice(0, 10)) {
      allShifts.push({ ...c, fundName: fund.name, fundId: fund.id });
    }
  }

  return allShifts.sort((a, b) => Math.abs(b.valueDelta) - Math.abs(a.valueDelta)).slice(0, 20);
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

// --- Social Queries ---

export interface SocialPost {
  id: number;
  platform: string;
  authorHandle: string | null;
  content: string;
  sourceUrl: string | null;
  publishedDate: Date | null;
  matchedTickers: string | null;
  matchedFundIds: string | null;
}

export async function getLatestSocialPosts(
  limit: number = 30,
  platform?: string
): Promise<SocialPost[]> {
  let query = db
    .select()
    .from(socialPosts)
    .orderBy(desc(socialPosts.publishedDate))
    .limit(limit);

  if (platform) {
    query = query.where(eq(socialPosts.platform, platform)) as typeof query;
  }

  return query;
}

export async function getSocialByTicker(
  ticker: string,
  limit: number = 15
): Promise<SocialPost[]> {
  const allPosts = await db
    .select()
    .from(socialPosts)
    .orderBy(desc(socialPosts.publishedDate))
    .limit(200);

  return allPosts
    .filter((post) => {
      if (!post.matchedTickers) return false;
      try {
        const tickers: string[] = JSON.parse(post.matchedTickers);
        return tickers.some((t) => t.toUpperCase() === ticker.toUpperCase());
      } catch {
        return false;
      }
    })
    .slice(0, limit);
}
