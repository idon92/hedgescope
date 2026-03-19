import { NextRequest, NextResponse } from "next/server";
import { searchFundsAndTickers } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  try {
    const results = await searchFundsAndTickers(q);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { funds: [], tickers: [] },
      { status: 500 }
    );
  }
}
