// --- Market Cap Categories ---
// Based on market value in the 13F (in thousands)
// These thresholds approximate standard classifications

export type CapCategory = "Mega Cap" | "Large Cap" | "Mid Cap" | "Small Cap" | "Micro Cap";

export function getCapCategory(marketValueThousands: number): CapCategory {
  const valueUsd = marketValueThousands * 1000;
  if (valueUsd >= 200_000_000_000) return "Mega Cap";   // $200B+
  if (valueUsd >= 10_000_000_000) return "Large Cap";    // $10B+
  if (valueUsd >= 2_000_000_000) return "Mid Cap";       // $2B+
  if (valueUsd >= 300_000_000) return "Small Cap";       // $300M+
  return "Micro Cap";
}

// --- Sector/Industry Classification ---
// Map well-known tickers to sectors. For tickers we don't know, use "Other".

export type Sector =
  | "Technology"
  | "Healthcare"
  | "Financials"
  | "Consumer Discretionary"
  | "Consumer Staples"
  | "Energy"
  | "Industrials"
  | "Communication Services"
  | "Real Estate"
  | "Materials"
  | "Utilities"
  | "ETF/Index"
  | "Other";

const TICKER_SECTORS: Record<string, Sector> = {
  // Technology
  AAPL: "Technology", MSFT: "Technology", NVDA: "Technology", AVGO: "Technology",
  ADBE: "Technology", CRM: "Technology", ORCL: "Technology", INTC: "Technology",
  AMD: "Technology", QCOM: "Technology", TXN: "Technology", IBM: "Technology",
  NOW: "Technology", AMAT: "Technology", LRCX: "Technology", KLAC: "Technology",
  SNPS: "Technology", CDNS: "Technology", MRVL: "Technology", ADI: "Technology",
  MU: "Technology", DELL: "Technology", HPQ: "Technology", CSCO: "Technology",
  // Healthcare
  UNH: "Healthcare", JNJ: "Healthcare", LLY: "Healthcare", PFE: "Healthcare",
  ABBV: "Healthcare", MRK: "Healthcare", TMO: "Healthcare", ABT: "Healthcare",
  BMY: "Healthcare", AMGN: "Healthcare", GILD: "Healthcare", ISRG: "Healthcare",
  MDT: "Healthcare", SYK: "Healthcare", REGN: "Healthcare", VRTX: "Healthcare",
  BSX: "Healthcare", ZTS: "Healthcare", ELV: "Healthcare", CI: "Healthcare",
  HCA: "Healthcare", HUM: "Healthcare", DXCM: "Healthcare", BIIB: "Healthcare",
  // Financials
  JPM: "Financials", BAC: "Financials", WFC: "Financials", GS: "Financials",
  MS: "Financials", C: "Financials", BLK: "Financials", SCHW: "Financials",
  AXP: "Financials", USB: "Financials", PNC: "Financials", TFC: "Financials",
  "BRK-B": "Financials", "BRK-A": "Financials", V: "Financials", MA: "Financials",
  COF: "Financials", MET: "Financials", PRU: "Financials", AIG: "Financials",
  ICE: "Financials", CME: "Financials", MCO: "Financials", SPGI: "Financials",
  // Consumer Discretionary
  AMZN: "Consumer Discretionary", TSLA: "Consumer Discretionary",
  HD: "Consumer Discretionary", MCD: "Consumer Discretionary",
  NKE: "Consumer Discretionary", SBUX: "Consumer Discretionary",
  TGT: "Consumer Discretionary", LOW: "Consumer Discretionary",
  TJX: "Consumer Discretionary", BKNG: "Consumer Discretionary",
  MAR: "Consumer Discretionary", GM: "Consumer Discretionary",
  F: "Consumer Discretionary", ROST: "Consumer Discretionary",
  ETSY: "Consumer Discretionary", CMG: "Consumer Discretionary",
  // Consumer Staples
  PG: "Consumer Staples", KO: "Consumer Staples", PEP: "Consumer Staples",
  WMT: "Consumer Staples", COST: "Consumer Staples", PM: "Consumer Staples",
  MO: "Consumer Staples", CL: "Consumer Staples", MDLZ: "Consumer Staples",
  KHC: "Consumer Staples", GIS: "Consumer Staples", SYY: "Consumer Staples",
  CVS: "Consumer Staples", WBA: "Consumer Staples", EL: "Consumer Staples",
  STZ: "Consumer Staples", KR: "Consumer Staples", HSY: "Consumer Staples",
  // Energy
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy",
  EOG: "Energy", MPC: "Energy", PSX: "Energy", VLO: "Energy",
  OXY: "Energy", HAL: "Energy", DVN: "Energy", HES: "Energy",
  PXD: "Energy", FANG: "Energy", BKR: "Energy",
  // Industrials
  CAT: "Industrials", DE: "Industrials", UNP: "Industrials",
  HON: "Industrials", UPS: "Industrials", RTX: "Industrials",
  BA: "Industrials", GE: "Industrials", LMT: "Industrials",
  MMM: "Industrials", GD: "Industrials", NOC: "Industrials",
  WM: "Industrials", EMR: "Industrials", ETN: "Industrials",
  ITW: "Industrials", FDX: "Industrials",
  // Communication Services
  GOOGL: "Communication Services", GOOG: "Communication Services",
  META: "Communication Services", DIS: "Communication Services",
  CMCSA: "Communication Services", NFLX: "Communication Services",
  T: "Communication Services", VZ: "Communication Services",
  TMUS: "Communication Services", ATVI: "Communication Services",
  EA: "Communication Services", TTWO: "Communication Services",
  // Real Estate
  AMT: "Real Estate", PLD: "Real Estate", CCI: "Real Estate",
  EQIX: "Real Estate", SPG: "Real Estate", PSA: "Real Estate",
  O: "Real Estate", WELL: "Real Estate", DLR: "Real Estate",
  // Materials
  LIN: "Materials", APD: "Materials", SHW: "Materials",
  ECL: "Materials", FCX: "Materials", NEM: "Materials",
  NUE: "Materials", DD: "Materials",
  // Utilities
  NEE: "Utilities", DUK: "Utilities", SO: "Utilities",
  D: "Utilities", AEP: "Utilities", EXC: "Utilities",
  SRE: "Utilities", XEL: "Utilities",
  // ETFs
  SPY: "ETF/Index", QQQ: "ETF/Index", IWM: "ETF/Index",
  DIA: "ETF/Index", VTI: "ETF/Index", VOO: "ETF/Index",
  EFA: "ETF/Index", EEM: "ETF/Index", TLT: "ETF/Index",
  HYG: "ETF/Index", LQD: "ETF/Index", GLD: "ETF/Index",
  SLV: "ETF/Index", XLF: "ETF/Index", XLK: "ETF/Index",
  XLE: "ETF/Index", XLV: "ETF/Index", XLI: "ETF/Index",
  XLP: "ETF/Index", XLY: "ETF/Index", XLU: "ETF/Index",
  XLB: "ETF/Index", XLRE: "ETF/Index", XLC: "ETF/Index",
  IVV: "ETF/Index", AGG: "ETF/Index", BND: "ETF/Index",
  ARKK: "ETF/Index", VEA: "ETF/Index", VWO: "ETF/Index",
};

export function getSector(ticker: string | null, companyName?: string): Sector {
  if (ticker && TICKER_SECTORS[ticker.toUpperCase()]) {
    return TICKER_SECTORS[ticker.toUpperCase()];
  }

  // Heuristic from company name
  if (companyName) {
    const upper = companyName.toUpperCase();
    if (upper.includes("ETF") || upper.includes("TRUST") || upper.includes("INDEX") || upper.includes("FUND")) return "ETF/Index";
    if (upper.includes("PHARMA") || upper.includes("THERAPEUTIC") || upper.includes("BIOTECH") || upper.includes("MEDICAL")) return "Healthcare";
    if (upper.includes("BANK") || upper.includes("FINANCIAL") || upper.includes("CAPITAL") || upper.includes("INSURANCE")) return "Financials";
    if (upper.includes("ENERGY") || upper.includes("PETROLEUM") || upper.includes("OIL") || upper.includes("GAS")) return "Energy";
    if (upper.includes("TECH") || upper.includes("SOFTWARE") || upper.includes("SEMICONDUCTOR") || upper.includes("DIGITAL")) return "Technology";
    if (upper.includes("REAL ESTATE") || upper.includes("REALTY") || upper.includes("REIT")) return "Real Estate";
    if (upper.includes("UTILITY") || upper.includes("ELECTRIC") || upper.includes("POWER")) return "Utilities";
  }

  return "Other";
}

// --- Geography ---
// Most 13F holdings are US-listed. We classify by company HQ geography.

export type Geography = "North America" | "Europe" | "Asia Pacific" | "Emerging Markets" | "Other";

const TICKER_GEOGRAPHY: Record<string, Geography> = {
  // European-HQ'd companies listed in US
  SAP: "Europe", ASML: "Europe", NVO: "Europe", AZN: "Europe",
  GSK: "Europe", BP: "Europe", SHEL: "Europe", TTE: "Europe",
  UL: "Europe", DEO: "Europe", RIO: "Europe", BHP: "Europe",
  NVS: "Europe", SNY: "Europe", ABB: "Europe", SPOT: "Europe",
  // Asia Pacific
  TSM: "Asia Pacific", BABA: "Asia Pacific", JD: "Asia Pacific",
  PDD: "Asia Pacific", BIDU: "Asia Pacific", NIO: "Asia Pacific",
  SONY: "Asia Pacific", TM: "Asia Pacific", HMC: "Asia Pacific",
  INFY: "Asia Pacific", WIT: "Asia Pacific",
  // Emerging Markets
  VALE: "Emerging Markets", PBR: "Emerging Markets", NU: "Emerging Markets",
  MELI: "Emerging Markets",
};

export function getGeography(ticker: string | null): Geography {
  if (ticker && TICKER_GEOGRAPHY[ticker.toUpperCase()]) {
    return TICKER_GEOGRAPHY[ticker.toUpperCase()];
  }
  // Default: most US-listed 13F securities are North American
  return "North America";
}

// --- Aggregate holdings into categories ---

export interface CategoryBreakdown {
  name: string;
  value: number; // market value in thousands
  count: number; // number of positions
}

export function categorizeHoldings(
  holdings: Array<{
    ticker: string | null;
    companyName: string;
    marketValueThousands: number;
    shares: number;
  }>
): {
  bySector: CategoryBreakdown[];
  byCap: CategoryBreakdown[];
  byGeography: CategoryBreakdown[];
} {
  const sectorMap = new Map<string, CategoryBreakdown>();
  const capMap = new Map<string, CategoryBreakdown>();
  const geoMap = new Map<string, CategoryBreakdown>();

  for (const h of holdings) {
    const sector = getSector(h.ticker, h.companyName);
    const cap = getCapCategory(h.marketValueThousands);
    const geo = getGeography(h.ticker);

    // Sector
    const s = sectorMap.get(sector) || { name: sector, value: 0, count: 0 };
    s.value += h.marketValueThousands;
    s.count += 1;
    sectorMap.set(sector, s);

    // Cap
    const c = capMap.get(cap) || { name: cap, value: 0, count: 0 };
    c.value += h.marketValueThousands;
    c.count += 1;
    capMap.set(cap, c);

    // Geography
    const g = geoMap.get(geo) || { name: geo, value: 0, count: 0 };
    g.value += h.marketValueThousands;
    g.count += 1;
    geoMap.set(geo, g);
  }

  const sortByValue = (a: CategoryBreakdown, b: CategoryBreakdown) => b.value - a.value;

  return {
    bySector: Array.from(sectorMap.values()).sort(sortByValue),
    byCap: Array.from(capMap.values()).sort(sortByValue),
    byGeography: Array.from(geoMap.values()).sort(sortByValue),
  };
}
