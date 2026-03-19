// Simple CUSIP-to-ticker mapping for common securities
// This will be enriched over time from parsed filings
const KNOWN_CUSIPS: Record<string, string> = {
  "594918104": "MSFT",
  "037833100": "AAPL",
  "02079K305": "GOOG",
  "02079K107": "GOOGL",
  "023135106": "AMZN",
  "67066G104": "NVDA",
  "88160R101": "TSLA",
  "30303M102": "META",
  "11135F101": "AVGO",
  "46625H100": "JPM",
  "92826C839": "V",
  "571903202": "MA",
  "478160104": "JNJ",
  "742718109": "PG",
  "91324P102": "UNH",
  "459200101": "IBM",
  "084670702": "BRK-B",
  "22160K105": "COST",
  "58933Y105": "MRK",
  "609207105": "MO",
  "718172109": "PFE",
  "00206R102": "T",
  "172967424": "C",
  "060505104": "BAC",
  "931142103": "WMT",
  "126650100": "CVS",
  "747525103": "QCOM",
  "00724F101": "ADBE",
  "035420103": "ANSS",
  "268648102": "DIS",
  "46120E602": "INTC",
  "88579Y101": "TMO",
  "00287Y109": "ABBV",
  "532457108": "LLY",
  "110122108": "BMY",
  "464287200": "ISRG",
  "57636Q104": "MA",
  "437076102": "HD",
  "20030N101": "CMCSA",
  "713448108": "PEP",
  "191216100": "KO",
  "98978V103": "ZM",
  "79466L302": "CRM",
  "67103H107": "ORCL",
  "29786A106": "ETSY",
  "872540109": "TGT",
};

/**
 * Resolve a CUSIP to a ticker symbol.
 * Falls back to company name abbreviation if no mapping found.
 */
export async function resolveCusipToTicker(
  cusip: string,
  companyName?: string
): Promise<string | null> {
  // Check known CUSIPs first
  if (KNOWN_CUSIPS[cusip]) {
    return KNOWN_CUSIPS[cusip];
  }

  // Try to derive from company name as last resort
  if (companyName) {
    // Common patterns
    const upperName = companyName.toUpperCase();
    if (upperName.includes("APPLE")) return "AAPL";
    if (upperName.includes("MICROSOFT")) return "MSFT";
    if (upperName.includes("AMAZON")) return "AMZN";
    if (upperName.includes("ALPHABET") || upperName.includes("GOOGLE")) return "GOOGL";
    if (upperName.includes("NVIDIA")) return "NVDA";
    if (upperName.includes("TESLA")) return "TSLA";
    if (upperName.includes("META PLATFORMS") || upperName.includes("FACEBOOK")) return "META";
    if (upperName.includes("BERKSHIRE")) return "BRK-B";
    if (upperName.includes("JPMORGAN")) return "JPM";
    if (upperName.includes("JOHNSON & JOHNSON") || upperName.includes("JOHNSON&JOHNSON")) return "JNJ";
    if (upperName.includes("WALMART")) return "WMT";
    if (upperName.includes("PROCTER")) return "PG";
    if (upperName.includes("UNITEDHEALTH")) return "UNH";
    if (upperName.includes("ELI LILLY")) return "LLY";
    if (upperName.includes("BROADCOM")) return "AVGO";
  }

  return null;
}

/**
 * Batch resolve an array of CUSIPs.
 */
export async function batchResolveCusips(
  entries: Array<{ cusip: string; companyName: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  for (const entry of entries) {
    const ticker = await resolveCusipToTicker(entry.cusip, entry.companyName);
    if (ticker) {
      results.set(entry.cusip, ticker);
    }
  }
  return results;
}
