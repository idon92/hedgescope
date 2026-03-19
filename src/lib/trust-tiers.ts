export enum TrustTier {
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
  TIER_4 = 4,
  TIER_5 = 5,
}

export const TRUST_TIER_LABELS: Record<TrustTier, string> = {
  [TrustTier.TIER_1]: "Primary Source",
  [TrustTier.TIER_2]: "Verified Press",
  [TrustTier.TIER_3]: "Analysis",
  [TrustTier.TIER_4]: "Aggregator",
  [TrustTier.TIER_5]: "Unverified",
};

export const TRUST_TIER_DESCRIPTIONS: Record<TrustTier, string> = {
  [TrustTier.TIER_1]: "Official Filing / Primary Source",
  [TrustTier.TIER_2]: "Established Financial Press",
  [TrustTier.TIER_3]: "Analyst & Industry Commentary",
  [TrustTier.TIER_4]: "Aggregator / Blog",
  [TrustTier.TIER_5]: "Social / Unverified",
};

export const TRUST_TIER_COLORS: Record<
  TrustTier,
  { bg: string; text: string; border: string }
> = {
  [TrustTier.TIER_1]: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  [TrustTier.TIER_2]: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  [TrustTier.TIER_3]: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
  },
  [TrustTier.TIER_4]: {
    bg: "bg-gray-700/50",
    text: "text-gray-500",
    border: "border-gray-600/30",
  },
  [TrustTier.TIER_5]: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
};

// Map source domains/names to trust tiers
export const SOURCE_TRUST_MAP: Record<string, TrustTier> = {
  // Tier 1 - Official
  "sec.gov": TrustTier.TIER_1,
  "edgar": TrustTier.TIER_1,

  // Tier 2 - Established Press
  "reuters.com": TrustTier.TIER_2,
  "reuters": TrustTier.TIER_2,
  "bloomberg.com": TrustTier.TIER_2,
  "bloomberg": TrustTier.TIER_2,
  "ft.com": TrustTier.TIER_2,
  "financial times": TrustTier.TIER_2,
  "wsj.com": TrustTier.TIER_2,
  "wall street journal": TrustTier.TIER_2,
  "cnbc.com": TrustTier.TIER_2,
  "cnbc": TrustTier.TIER_2,
  "nytimes.com": TrustTier.TIER_2,
  "barrons.com": TrustTier.TIER_2,

  // Tier 3 - Analyst
  "seekingalpha.com": TrustTier.TIER_3,
  "seeking alpha": TrustTier.TIER_3,
  "morningstar.com": TrustTier.TIER_3,
  "morningstar": TrustTier.TIER_3,
  "thestreet.com": TrustTier.TIER_3,
  "investopedia.com": TrustTier.TIER_3,

  // Tier 4 - Aggregator
  "businessinsider.com": TrustTier.TIER_4,
  "business insider": TrustTier.TIER_4,
  "finance.yahoo.com": TrustTier.TIER_4,
  "yahoo finance": TrustTier.TIER_4,
  "marketwatch.com": TrustTier.TIER_4,
  "marketwatch": TrustTier.TIER_4,
  "zerohedge.com": TrustTier.TIER_4,
  "benzinga.com": TrustTier.TIER_4,
  "benzinga": TrustTier.TIER_4,
  "fool.com": TrustTier.TIER_4,
  "motley fool": TrustTier.TIER_4,

  // Tier 5 - Social
  "twitter.com": TrustTier.TIER_5,
  "x.com": TrustTier.TIER_5,
  "reddit.com": TrustTier.TIER_5,
  "stocktwits.com": TrustTier.TIER_5,
};

export function getTrustTierForSource(sourceName: string, sourceUrl?: string): TrustTier {
  const nameLower = sourceName.toLowerCase();
  const urlLower = (sourceUrl || "").toLowerCase();

  // Check by source name
  for (const [key, tier] of Object.entries(SOURCE_TRUST_MAP)) {
    if (nameLower.includes(key) || urlLower.includes(key)) {
      return tier;
    }
  }

  // Default to Tier 4 for unknown sources
  return TrustTier.TIER_4;
}
