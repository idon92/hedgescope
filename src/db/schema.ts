import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cik: varchar("cik", { length: 20 }).notNull().unique(),
  lastFilingDate: timestamp("last_filing_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const holdings = pgTable(
  "holdings",
  {
    id: serial("id").primaryKey(),
    fundId: integer("fund_id")
      .references(() => funds.id)
      .notNull(),
    filingDate: timestamp("filing_date").notNull(),
    companyName: text("company_name").notNull(),
    cusip: varchar("cusip", { length: 9 }).notNull(),
    ticker: varchar("ticker", { length: 20 }),
    shares: bigint("shares", { mode: "number" }).notNull(),
    marketValueThousands: bigint("market_value_thousands", { mode: "number" }).notNull(),
    optionType: varchar("option_type", { length: 10 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    fundFilingIdx: index("holdings_fund_filing_idx").on(table.fundId, table.filingDate),
    cusipIdx: index("holdings_cusip_idx").on(table.cusip),
    tickerIdx: index("holdings_ticker_idx").on(table.ticker),
  })
);

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsArticles = pgTable(
  "news_articles",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url").notNull(),
    publishedDate: timestamp("published_date"),
    trustTier: integer("trust_tier").notNull(),
    matchedFundIds: text("matched_fund_ids"), // JSON array as text
    matchedTickers: text("matched_tickers"), // JSON array as text
    snippet: text("snippet"),
    contentHash: varchar("content_hash", { length: 64 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    trustTierIdx: index("news_trust_tier_idx").on(table.trustTier),
    publishedIdx: index("news_published_idx").on(table.publishedDate),
  })
);
