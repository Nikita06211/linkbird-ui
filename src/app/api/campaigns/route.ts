import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allCampaigns = await db.select().from(campaigns);
    return NextResponse.json(allCampaigns);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
