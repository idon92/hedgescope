import { z } from "zod";
import { SEC_HEADERS, delay } from "@/lib/sec-headers";
import { resolveCusipToTicker } from "./cusip-resolver";
import { parseStringPromise } from "xml2js";

// --- Zod schemas for SEC responses ---

const SubmissionsSchema = z.object({
  cik: z.union([z.string(), z.number()]),
  name: z.string(),
  filings: z.object({
    recent: z.object({
      accessionNumber: z.array(z.string()),
      filingDate: z.array(z.string()),
      primaryDocument: z.array(z.string()),
      form: z.array(z.string()),
    }),
  }),
});

// --- Types ---

export interface ParsedHolding {
  companyName: string;
  cusip: string;
  ticker: string | null;
  shares: number;
  marketValueThousands: number;
  optionType: string | null;
}

export interface Filing13F {
  accessionNumber: string;
  filingDate: string;
  holdings: ParsedHolding[];
}

// --- Service ---

/**
 * Fetch all submissions for a given CIK from EDGAR
 */
export async function fetchSubmissions(cik: string) {
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const res = await fetch(url, { headers: SEC_HEADERS });

  if (!res.ok) {
    throw new Error(`EDGAR submissions fetch failed for CIK ${cik}: ${res.status}`);
  }

  const data = await res.json();
  return SubmissionsSchema.parse(data);
}

/**
 * Get the most recent 13F-HR filings for a CIK
 */
export async function getRecent13FFilings(
  cik: string,
  limit: number = 2
): Promise<Array<{ accessionNumber: string; filingDate: string; primaryDocument: string }>> {
  const submissions = await fetchSubmissions(cik);
  const recent = submissions.filings.recent;

  const filings: Array<{
    accessionNumber: string;
    filingDate: string;
    primaryDocument: string;
  }> = [];

  for (let i = 0; i < recent.form.length && filings.length < limit; i++) {
    if (recent.form[i] === "13F-HR" || recent.form[i] === "13F-HR/A") {
      filings.push({
        accessionNumber: recent.accessionNumber[i],
        filingDate: recent.filingDate[i],
        primaryDocument: recent.primaryDocument[i],
      });
    }
  }

  return filings;
}

/**
 * Fetch and parse the 13F information table (XML) for a filing
 */
export async function parse13FHoldings(
  cik: string,
  accessionNumber: string
): Promise<ParsedHolding[]> {
  // accession number format: 0001234567-24-001234 -> 000123456724001234
  const accessionClean = accessionNumber.replace(/-/g, "");
  await delay();

  // Try to get the XML info table directly - common naming patterns
  const xmlPatterns = [
    `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/infotable.xml`,
    `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/InfoTable.xml`,
    `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/informationtable.xml`,
    `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/InformationTable.xml`,
  ];

  // Also try the filing index to find the actual XML file name
  let xmlContent: string | null = null;

  // First attempt: try known XML patterns
  for (const xmlUrl of xmlPatterns) {
    try {
      const res = await fetch(xmlUrl, { headers: { ...SEC_HEADERS, Accept: "text/xml" } });
      if (res.ok) {
        xmlContent = await res.text();
        break;
      }
    } catch {
      // try next pattern
    }
    await delay();
  }

  // Second attempt: fetch the filing index page to find the XML file
  if (!xmlContent) {
    try {
      const filingIndexUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/`;
      const indexRes = await fetch(filingIndexUrl, { headers: SEC_HEADERS });
      if (indexRes.ok) {
        const indexHtml = await indexRes.text();
        // Look for XML files that might be the info table
        const xmlMatch = indexHtml.match(
          /href="([^"]*(?:infotable|information|13f|holdings)[^"]*\.xml)"/i
        );
        if (xmlMatch) {
          await delay();
          const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/${xmlMatch[1]}`;
          const xmlRes = await fetch(xmlUrl, { headers: { ...SEC_HEADERS, Accept: "text/xml" } });
          if (xmlRes.ok) {
            xmlContent = await xmlRes.text();
          }
        }
      }
    } catch (err) {
      console.error("Failed to find XML info table from index:", err);
    }
  }

  if (!xmlContent) {
    console.warn(`No XML info table found for ${cik} filing ${accessionNumber}`);
    return [];
  }

  return parseInfoTableXml(xmlContent);
}

/**
 * Parse the 13F XML information table
 */
async function parseInfoTableXml(xmlContent: string): Promise<ParsedHolding[]> {
  const holdings: ParsedHolding[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await parseStringPromise(xmlContent, {
      explicitArray: false,
      ignoreAttrs: true,
      tagNameProcessors: [(name: string) => name.replace(/^.*:/, "")],
    });

    // The root element varies: informationTable, edgarSubmission, etc.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let infoTable: any = null;

    if (result.informationTable) {
      infoTable = result.informationTable;
    } else if (result.edgarSubmission) {
      infoTable = result.edgarSubmission.informationTable || result.edgarSubmission;
    } else {
      // Try to find infoTable in any root
      const rootKey = Object.keys(result)[0];
      infoTable = result[rootKey];
    }

    if (!infoTable) return [];

    // Get the info table entries
    let entries = infoTable.infoTable || infoTable;
    if (!Array.isArray(entries)) {
      entries = [entries];
    }

    for (const entry of entries) {
      try {
        const nameOfIssuer = entry.nameOfIssuer || entry.nameofissuer || "";
        const cusip = entry.cusip || entry.CUSIP || "";
        const value = entry.value || entry.VALUE || 0;

        // shares info can be nested
        const shrsOrPrnAmt =
          entry.shrsOrPrnAmt || entry.shrsorprnamt || entry.SHRSORPRNAMT || {};
        const shares =
          parseInt(shrsOrPrnAmt.sshPrnamt || shrsOrPrnAmt.SSHPRNAMT || "0", 10) || 0;

        const putCall =
          entry.putCall || entry.putcall || entry.PUTCALL || null;

        const ticker = await resolveCusipToTicker(cusip, nameOfIssuer);

        holdings.push({
          companyName: nameOfIssuer,
          cusip,
          ticker,
          shares,
          marketValueThousands: parseInt(String(value), 10) || 0,
          optionType: putCall || null,
        });
      } catch (entryErr) {
        console.warn("Failed to parse holding entry:", entryErr);
      }
    }
  } catch (err) {
    console.error("Failed to parse 13F XML:", err);
  }

  return holdings;
}
