import { NextRequest, NextResponse } from "next/server";
import { syncAllNews } from "@/services/news-ingestion";

export async function POST(_request: NextRequest) {
  try {
    const results = await syncAllNews();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Sync news failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncAllNews();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Sync news cron failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
