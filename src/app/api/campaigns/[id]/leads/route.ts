import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, leads } from "@/lib/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const { id: campaignId } = await params;

    console.log('Campaign Leads API - User ID:', user.id);
    console.log('Campaign Leads API - Campaign ID:', campaignId);
    
    // Debug: Check what campaigns exist
    const allCampaigns = await db.select({ id: campaigns.id, name: campaigns.name, userId: campaigns.userId }).from(campaigns);
    console.log('All campaigns in database:', allCampaigns);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '0');
    const search = searchParams.get('search');

    // Check if campaign exists (no user filtering)
    const campaignExists = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.id, parseInt(campaignId)))
      .limit(1);

    if (campaignExists.length === 0) {
      console.log('Campaign not found for ID:', campaignId);
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Build query for leads
    const conditions = [eq(leads.campaignId, parseInt(campaignId))];

    if (status && status !== 'all') {
      conditions.push(eq(leads.status, status as "pending" | "contacted" | "responded" | "converted"));
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

