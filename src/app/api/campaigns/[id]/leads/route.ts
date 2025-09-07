import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, leads } from "@/lib/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const campaignId = params.id;

    console.log('Campaign Leads API - User ID:', user.id);
    console.log('Campaign Leads API - Campaign ID:', campaignId);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '0');
    const search = searchParams.get('search');

    // First check if campaign belongs to user
    const userCampaign = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(eq(campaigns.id, parseInt(campaignId)), eq(campaigns.userId, user.id)))
      .limit(1);

    let campaignExists = userCampaign.length > 0;
    let targetUserId = user.id;

    // If no campaign found for current user, check test user (for demo purposes)
    if (!campaignExists) {
      const testUserCampaign = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(and(eq(campaigns.id, parseInt(campaignId)), eq(campaigns.userId, "test-user-123")))
        .limit(1);
      
      if (testUserCampaign.length > 0) {
        campaignExists = true;
        targetUserId = "test-user-123";
      }
    }

    if (!campaignExists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Build query for leads
    const conditions = [eq(leads.campaignId, parseInt(campaignId))];

    if (status && status !== 'all') {
      conditions.push(eq(leads.status, status as any));
    }

    // Add search functionality
    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`),
          ilike(leads.designation, `%${search}%`)
        )!
      );
    }

    const whereCondition = and(...conditions);
    const offset = page * limit;

    const campaignLeads = await db
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
      })
      .from(leads)
      .where(whereCondition)
      .orderBy(desc(leads.lastContactAt))
      .limit(limit)
      .offset(offset);

    console.log('Campaign leads found:', campaignLeads.length);
    return NextResponse.json({ leads: campaignLeads });
  } catch (error) {
    console.error("Error fetching campaign leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

