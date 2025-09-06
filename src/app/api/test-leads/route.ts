import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, campaigns } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("Test leads API called");
    
    // Get all leads without authentication for testing
    const allLeads = await db
      .select({
        id: leads.id,
        name: leads.name,
        designation: leads.designation,
        email: leads.email,
        company: leads.company,
        status: leads.status,
        lastContactAt: leads.lastContactAt,
        avatarUrl: leads.avatarUrl,
        campaignId: leads.campaignId,
        campaignName: campaigns.name,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .orderBy(desc(leads.lastContactAt))
      .limit(10);

    console.log("Found leads:", allLeads.length);
    console.log("Sample lead:", allLeads[0]);

    return NextResponse.json({ 
      leads: allLeads,
      count: allLeads.length,
      message: "Test successful"
    });
  } catch (error) {
    console.error("Error in test leads API:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

