import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, campaigns } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's campaigns first
    const userCampaigns = await db.select({ id: campaigns.id }).from(campaigns).where(eq(campaigns.userId, user.id));
    const campaignIds = userCampaigns.map(c => c.id);

    if (campaignIds.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    // Build query for leads
    let whereCondition;

    if (status && status !== 'all') {
      whereCondition = and(eq(campaigns.userId, user.id), eq(leads.status, status as any));
    } else {
      whereCondition = eq(campaigns.userId, user.id);
    }

    const userLeads = await db
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
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(whereCondition)
      .orderBy(desc(leads.lastContactAt))
      .limit(limit);

    // If no leads found for the current user, show leads for test user (for demo purposes)
    if (userLeads.length === 0) {
      console.log('No leads for current user, showing test user leads');
      const testUserLeads = await db
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
        .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
        .where(eq(campaigns.userId, "test-user-123"))
        .orderBy(desc(leads.lastContactAt))
        .limit(limit);
      
      console.log('Test user leads found:', testUserLeads.length);
      return NextResponse.json({ leads: testUserLeads });
    }

    return NextResponse.json({ leads: userLeads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}