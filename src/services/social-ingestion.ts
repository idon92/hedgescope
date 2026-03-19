import { db } from "@/db";
import { socialPosts, funds, holdings } from "@/db/schema";
import { createHash } from "crypto";

// --- Types ---

export interface SocialIngestionResult {
  source: string;
  status: "success" | "error" | "skipped";
  postsFound: number;
  postsInserted: number;
  error?: string;
}

interface MatchContext {
  fundNames: string[];
  fundIds: number[];
  tickers: string[];
}

// --- Helpers ---

function generateHash(content: string, platform: string): string {
  const normalized = `${content.toLowerCase().trim().substring(0, 200)}|${platform}`;
  return createHash("sha256").update(normalized).digest("hex").substring(0, 64);
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
  text: string,
  context: MatchContext
): { matchedFundIds: number[]; matchedTickers: string[] } {
  const lower = text.toLowerCase();
  const matchedFundIds: number[] = [];
  const matchedTickers: string[] = [];

  context.fundNames.forEach((name, i) => {
    const significantWords = name
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 3 &&
          !["associates", "advisors", "management", "capital", "group"].includes(
            w.toLowerCase()
          )
      );
    if (significantWords.some((w) => lower.includes(w.toLowerCase()))) {
      matchedFundIds.push(context.fundIds[i]);
    }
  });

  context.tickers.forEach((ticker) => {
    if (ticker.length < 2) return;
    // For social posts, look for $TICKER or word-boundary ticker mentions
    const patterns = [
      new RegExp(`\\$${ticker}\\b`, "i"),
      new RegExp(`\\b${ticker}\\b`, "i"),
    ];
    if (patterns.some((p) => p.test(text))) {
      matchedTickers.push(ticker);
    }
  });

  return { matchedFundIds, matchedTickers };
}

// --- Reddit Integration ---

async function ingestReddit(context: MatchContext): Promise<SocialIngestionResult[]> {
  const subreddits = ["wallstreetbets", "stocks", "investing"];
  const results: SocialIngestionResult[] = [];

  for (const sub of subreddits) {
    try {
      // Reddit public JSON API (no auth needed for read)
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, {
        headers: {
          "User-Agent": "HedgeScope/1.0 (Social Aggregator)",
        },
      });

      if (!res.ok) {
        results.push({
          source: `Reddit r/${sub}`,
          status: "error",
          postsFound: 0,
          postsInserted: 0,
          error: `HTTP ${res.status}`,
        });
        continue;
      }

      const data = await res.json();
      const posts = data?.data?.children || [];
      let inserted = 0;

      for (const post of posts) {
        const d = post.data;
        if (!d || !d.title) continue;

        const content = `${d.title}${d.selftext ? ` — ${d.selftext.substring(0, 300)}` : ""}`;
        const contentHash = generateHash(content, "reddit");
        const { matchedFundIds, matchedTickers } = matchContent(content, context);

        try {
          await db.insert(socialPosts).values({
            platform: "reddit",
            authorHandle: d.author || null,
            content: content.substring(0, 500),
            sourceUrl: `https://reddit.com${d.permalink || ""}`,
            publishedDate: d.created_utc
              ? new Date(d.created_utc * 1000)
              : null,
            matchedTickers: JSON.stringify(matchedTickers),
            matchedFundIds: JSON.stringify(matchedFundIds),
            contentHash,
          }).onConflictDoNothing();
          inserted++;
        } catch {
          // Duplicate
        }
      }

      results.push({
        source: `Reddit r/${sub}`,
        status: "success",
        postsFound: posts.length,
        postsInserted: inserted,
      });
    } catch (err) {
      results.push({
        source: `Reddit r/${sub}`,
        status: "error",
        postsFound: 0,
        postsInserted: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

// --- StockTwits Integration ---

async function ingestStockTwits(context: MatchContext): Promise<SocialIngestionResult[]> {
  const results: SocialIngestionResult[] = [];

  // Fetch trending streams
  const endpoints = [
    { name: "StockTwits Trending", url: "https://api.stocktwits.com/api/2/streams/trending.json" },
  ];

  // Also fetch for top tracked tickers
  const topTickers = context.tickers.slice(0, 5);
  for (const ticker of topTickers) {
    endpoints.push({
      name: `StockTwits $${ticker}`,
      url: `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`,
    });
  }

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        headers: { "User-Agent": "HedgeScope/1.0" },
      });

      if (!res.ok) {
        results.push({
          source: endpoint.name,
          status: "error",
          postsFound: 0,
          postsInserted: 0,
          error: `HTTP ${res.status}`,
        });
        continue;
      }

      const data = await res.json();
      const messages = data?.messages || [];
      let inserted = 0;

      for (const msg of messages) {
        if (!msg.body) continue;

        const content = msg.body.substring(0, 500);
        const contentHash = generateHash(content, "stocktwits");
        const { matchedFundIds, matchedTickers } = matchContent(content, context);

        // Also capture tickers mentioned by StockTwits itself
        if (msg.symbols) {
          for (const sym of msg.symbols) {
            if (sym.symbol && !matchedTickers.includes(sym.symbol)) {
              matchedTickers.push(sym.symbol);
            }
          }
        }

        try {
          await db.insert(socialPosts).values({
            platform: "stocktwits",
            authorHandle: msg.user?.username || null,
            content,
            sourceUrl: `https://stocktwits.com/message/${msg.id}`,
            publishedDate: msg.created_at ? new Date(msg.created_at) : null,
            matchedTickers: JSON.stringify(matchedTickers),
            matchedFundIds: JSON.stringify(matchedFundIds),
            contentHash,
          }).onConflictDoNothing();
          inserted++;
        } catch {
          // Duplicate
        }
      }

      results.push({
        source: endpoint.name,
        status: "success",
        postsFound: messages.length,
        postsInserted: inserted,
      });
    } catch (err) {
      results.push({
        source: endpoint.name,
        status: "error",
        postsFound: 0,
        postsInserted: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

// --- Main Sync ---

export async function syncAllSocial(): Promise<SocialIngestionResult[]> {
  const context = await loadMatchContext();

  const [redditResults, stocktwitsResults] = await Promise.all([
    ingestReddit(context),
    ingestStockTwits(context),
  ]);

  return [...redditResults, ...stocktwitsResults];
}
