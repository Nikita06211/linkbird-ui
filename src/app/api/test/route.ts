import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, leads, user } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const allUsers = await db.select().from(user);
    const allCampaigns = await db.select().from(campaigns);
    const allLeads = await db.select().from(leads);

    return NextResponse.json({
      users: allUsers.length,
      campaigns: allCampaigns.length,
      leads: allLeads.length,
      sampleUser: allUsers[0] || null,
      sampleCampaign: allCampaigns[0] || null,
      sampleLead: allLeads[0] || null,
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
