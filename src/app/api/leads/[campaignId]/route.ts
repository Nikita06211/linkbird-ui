import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const campaignLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.campaignId, Number(campaignId)));

    return NextResponse.json(campaignLeads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch campaign leads" }, { status: 500 });
  }
}
