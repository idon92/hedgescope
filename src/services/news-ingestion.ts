import { db } from "@/db";
import { newsArticles, funds, holdings } from "@/db/schema";
import { createHash } from "crypto";
import { getTrustTierForSource, TrustTier } from "@/lib/trust-tiers";
import RssParser from "rss-parser";

const rssParser = new RssParser({
  timeout: 10000,
  headers: {
    "User-Agent": "HedgeScope/1.0 NewsAggregator",
  },
});

// --- RSS Feed Sources ---

interface RssSource {
  name: string;
  url: string;
  trustTier?: TrustTier;
}

const RSS_FEEDS: RssSource[] = [
  // Tier 2 - Established Press
  { name: "Reuters Business", url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best" },
  { name: "CNBC Top News", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114" },
  { name: "CNBC Finance", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664" },
  { name: "MarketWatch Top Stories", url: "https://feeds.marketwatch.com/marketwatch/topstories/" },
  { name: "MarketWatch Markets", url: "https://feeds.marketwatch.com/marketwatch/marketpulse/" },
  // Tier 3 - Analyst
  { name: "Seeking Alpha Market News", url: "https://seekingalpha.com/market_currents.xml" },
  // Tier 4 - Aggregator
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex" },
];

// --- Content Hash for deduplication ---

function generateContentHash(title: string, sourceDomain: string): string {
  const normalized = `${title.toLowerCase().trim()}|${sourceDomain.toLowerCase().trim()}`;
  return createHash("sha256").update(normalized).digest("hex").substring(0, 64);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// --- Ticker/Fund Matching ---

interface MatchContext {
  fundNames: string[];
  fundIds: number[];
  tickers: string[];
}

async function loadMatchContext(): Promise<MatchContext> {
  const allFunds = await db.select().from(funds);
  const allHoldings = await db
    .select({ ticker: holdings.ticker })
    .from(holdings)
    .groupBy(holdings.ticker);

  return {
    fundNames: allFunds.map((f) => f.name),
    fundIds: allFunds.map((f) => f.id),
    tickers: allHoldings
      .map((h) => h.ticker)
      .filter((t): t is string => t !== null),
  };
}

function matchContent(
  title: string,
  snippet: string,
  context: MatchContext
): { matchedFundIds: number[]; matchedTickers: string[] } {
  const text = `${title} ${snippet}`.toLowerCase();
  const matchedFundIds: number[] = [];
  const matchedTickers: string[] = [];

  // Match fund names
  context.fundNames.forEach((name, i) => {
    // Match on significant words (skip "LP", "Associates", etc.)
    const significantWords = name
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["associates", "advisors", "management", "capital"].includes(w.toLowerCase()));

    if (significantWords.some((w) => text.includes(w.toLowerCase()))) {
      matchedFundIds.push(context.fundIds[i]);
    }
  });

  // Match tickers (word boundary match to avoid false positives)
  context.tickers.forEach((ticker) => {
    if (ticker.length < 2) return;
    const regex = new RegExp(`\\b${ticker}\\b`, "i");
    if (regex.test(title) || regex.test(snippet)) {
      matchedTickers.push(ticker);
    }
  });

  return { matchedFundIds, matchedTickers };
}

// --- RSS Ingestion ---

export interface NewsIngestionResult {
  source: string;
  status: "success" | "error";
  articlesFound: number;
  articlesInserted: number;
  error?: string;
}

async function ingestRssFeeds(context: MatchContext): Promise<NewsIngestionResult[]> {
  const results: NewsIngestionResult[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      let inserted = 0;

      for (const item of parsed.items || []) {
        if (!item.title) continue;

        const sourceUrl = item.link || feed.url;
        const sourceDomain = extractDomain(sourceUrl);
        const contentHash = generateContentHash(item.title, sourceDomain);
        const snippet = (item.contentSnippet || item.content || "").substring(0, 200);
        const trustTier =
          feed.trustTier || getTrustTierForSource(feed.name, sourceUrl);

        const { matchedFundIds, matchedTickers } = matchContent(
          item.title,
          snippet,
          context
        );

        try {
          await db.insert(newsArticles).values({
            title: item.title,
            sourceName: feed.name,
            sourceUrl,
            publishedDate: item.isoDate ? new Date(item.isoDate) : null,
            trustTier,
            matchedFundIds: JSON.stringify(matchedFundIds),
            matchedTickers: JSON.stringify(matchedTickers),
            snippet,
            contentHash,
          }).onConflictDoNothing();
          inserted++;
        } catch {
          // Duplicate hash — skip
        }
      }

      results.push({
        source: feed.name,
        status: "success",
        articlesFound: parsed.items?.length || 0,
        articlesInserted: inserted,
      });
    } catch (err) {
      console.error(`RSS feed error for ${feed.name}:`, err);
      results.push({
        source: feed.name,
        status: "error",
        articlesFound: 0,
        articlesInserted: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

// --- NewsAPI Integration ---

async function ingestNewsApi(context: MatchContext): Promise<NewsIngestionResult[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return [
      {
        source: "NewsAPI",
        status: "error",
        articlesFound: 0,
        articlesInserted: 0,
        error: "NEWS_API_KEY not configured",
      },
    ];
  }

  const results: NewsIngestionResult[] = [];

  // Build search queries from fund names and top tickers
  const queries = [
    "hedge fund 13F filing",
    "hedge fund holdings",
    ...context.fundNames.slice(0, 3).map((n) => n.split(" ")[0]), // First word of fund names
  ];

  for (const query of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        results.push({
          source: `NewsAPI: "${query}"`,
          status: "error",
          articlesFound: 0,
          articlesInserted: 0,
          error: `HTTP ${res.status}`,
        });
        continue;
      }

      const data = await res.json();
      const articles = data.articles || [];
      let inserted = 0;

      for (const article of articles) {
        if (!article.title || article.title === "[Removed]") continue;

        const sourceUrl = article.url || "";
        const sourceDomain = extractDomain(sourceUrl);
        const sourceName = article.source?.name || sourceDomain;
        const contentHash = generateContentHash(article.title, sourceDomain);
        const snippet = (article.description || "").substring(0, 200);
        const trustTier = getTrustTierForSource(sourceName, sourceUrl);

        const { matchedFundIds, matchedTickers } = matchContent(
          article.title,
          snippet,
          context
        );

        try {
          await db.insert(newsArticles).values({
            title: article.title,
            sourceName,
            sourceUrl,
            publishedDate: article.publishedAt
              ? new Date(article.publishedAt)
              : null,
            trustTier,
            matchedFundIds: JSON.stringify(matchedFundIds),
            matchedTickers: JSON.stringify(matchedTickers),
            snippet,
            contentHash,
          }).onConflictDoNothing();
          inserted++;
        } catch {
          // Duplicate
        }
      }

      results.push({
        source: `NewsAPI: "${query}"`,
        status: "success",
        articlesFound: articles.length,
        articlesInserted: inserted,
      });
    } catch (err) {
      results.push({
        source: `NewsAPI: "${query}"`,
        status: "error",
        articlesFound: 0,
        articlesInserted: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

// --- Main Sync Function ---

export async function syncAllNews(): Promise<NewsIngestionResult[]> {
  const context = await loadMatchContext();

  const [rssResults, newsApiResults] = await Promise.all([
    ingestRssFeeds(context),
    ingestNewsApi(context),
  ]);

  return [...rssResults, ...newsApiResults];
}
