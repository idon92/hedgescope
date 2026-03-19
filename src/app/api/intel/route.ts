import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialPosts } from "@/db/schema";
import { z } from "zod";
import { createHash } from "crypto";

const IntelSchema = z.object({
  platform: z.string().min(1),
  authorHandle: z.string().optional(),
  content: z.string().min(1).max(2000),
  sourceUrl: z.string().url().optional(),
  matchedTickers: z.array(z.string()).optional(),
  matchedFundIds: z.array(z.number()).optional(),
});

export async function POST(request: NextRequest) {
  // Verify API key
  const apiKey = request.headers.get("x-api-key");
  if (!process.env.INTEL_API_KEY || apiKey !== process.env.INTEL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = IntelSchema.parse(body);

    const contentHash = createHash("sha256")
      .update(`${data.content.toLowerCase().trim().substring(0, 200)}|${data.platform}`)
      .digest("hex")
      .substring(0, 64);

    await db.insert(socialPosts).values({
      platform: data.platform,
      authorHandle: data.authorHandle || null,
      content: data.content.substring(0, 500),
      sourceUrl: data.sourceUrl || null,
      publishedDate: new Date(),
      matchedTickers: JSON.stringify(data.matchedTickers || []),
      matchedFundIds: JSON.stringify(data.matchedFundIds || []),
      contentHash,
    }).onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.issues },
        { status: 400 }
      );
    }
    console.error("Intel API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
