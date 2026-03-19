import { NextRequest, NextResponse } from "next/server";
import { syncAllFilings } from "@/services/sync-filings";

// POST /api/sync-filings — manual trigger
export async function POST(_request: NextRequest) {
  try {
    const results = await syncAllFilings();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Sync filings failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/sync-filings — cron-compatible
export async function GET(request: NextRequest) {
  // Optional: verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllFilings();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Sync filings cron failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
