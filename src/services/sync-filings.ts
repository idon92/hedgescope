import { db } from "@/db";
import { funds, holdings } from "@/db/schema";
import { TRACKED_FUNDS } from "@/config/funds";
import { getRecent13FFilings, parse13FHoldings } from "./edgar";
import { delay } from "@/lib/sec-headers";
import { eq, and } from "drizzle-orm";

export interface SyncResult {
  fund: string;
  status: "success" | "error";
  filingsProcessed: number;
  holdingsInserted: number;
  error?: string;
}

/**
 * Ensure all tracked funds exist in the database
 */
async function ensureFundsExist(): Promise<Map<string, number>> {
  const fundIdMap = new Map<string, number>();

  for (const tracked of TRACKED_FUNDS) {
    // Upsert fund
    const existing = await db
      .select()
      .from(funds)
      .where(eq(funds.cik, tracked.cik))
      .limit(1);

    if (existing.length > 0) {
      fundIdMap.set(tracked.cik, existing[0].id);
    } else {
      const inserted = await db
        .insert(funds)
        .values({ name: tracked.name, cik: tracked.cik })
        .returning({ id: funds.id });
      fundIdMap.set(tracked.cik, inserted[0].id);
    }
  }

  return fundIdMap;
}

/**
 * Sync all tracked fund filings from EDGAR into the database
 */
export async function syncAllFilings(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  const fundIdMap = await ensureFundsExist();

  for (const tracked of TRACKED_FUNDS) {
    try {
      console.log(`Syncing filings for ${tracked.name} (CIK: ${tracked.cik})...`);
      const fundId = fundIdMap.get(tracked.cik)!;

      // Get recent 13F filings (last 2 for quarter comparison)
      const filings = await getRecent13FFilings(tracked.cik, 2);
      let totalHoldings = 0;

      for (const filing of filings) {
        // Parse holdings from the filing
        const parsedHoldings = await parse13FHoldings(tracked.cik, filing.accessionNumber);

        if (parsedHoldings.length === 0) {
          console.warn(`No holdings parsed for ${tracked.name} filing ${filing.accessionNumber}`);
          continue;
        }

        // Delete holdings for this specific fund+date combo to avoid duplicates
        const filingDate = new Date(filing.filingDate);
        await db
          .delete(holdings)
          .where(and(eq(holdings.fundId, fundId), eq(holdings.filingDate, filingDate)));

        // Insert all holdings
        const holdingValues = parsedHoldings.map((h) => ({
          fundId,
          filingDate: filingDate,
          companyName: h.companyName,
          cusip: h.cusip,
          ticker: h.ticker,
          shares: h.shares,
          marketValueThousands: h.marketValueThousands,
          optionType: h.optionType,
        }));

        // Insert in batches to avoid exceeding query limits
        const BATCH_SIZE = 100;
        for (let i = 0; i < holdingValues.length; i += BATCH_SIZE) {
          const batch = holdingValues.slice(i, i + BATCH_SIZE);
          await db.insert(holdings).values(batch);
        }

        totalHoldings += parsedHoldings.length;

        // Update the fund's last filing date
        await db
          .update(funds)
          .set({ lastFilingDate: filingDate })
          .where(eq(funds.id, fundId));

        await delay(500); // Be respectful of SEC rate limits between filings
      }

      results.push({
        fund: tracked.name,
        status: "success",
        filingsProcessed: filings.length,
        holdingsInserted: totalHoldings,
      });
    } catch (err) {
      console.error(`Error syncing ${tracked.name}:`, err);
      results.push({
        fund: tracked.name,
        status: "error",
        filingsProcessed: 0,
        holdingsInserted: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    await delay(1000); // Pause between funds
  }

  return results;
}
