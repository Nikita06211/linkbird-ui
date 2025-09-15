import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, leads } from "@/lib/schema";
import { eq, and, count, sql } from "drizzle-orm";
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

    console.log('Campaign Details API - User ID:', user.id);
    console.log('Campaign Details API - Campaign ID:', campaignId);

    // Debug: Check what campaigns exist
    const allCampaigns = await db.select({ id: campaigns.id, name: campaigns.name, userId: campaigns.userId }).from(campaigns);
    console.log('All campaigns in database:', allCampaigns);

    // Get campaign by ID only (no user filtering)
    const campaign = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        totalLeads: count(leads.id).as('totalLeads'),
        successfulLeads: sql<number>`COUNT(CASE WHEN ${leads.status} = 'responded' OR ${leads.status} = 'converted' THEN 1 END)`.as('successfulLeads'),
        responseRate: sql<number>`CASE 
          WHEN COUNT(${leads.id}) > 0 
          THEN ROUND((COUNT(CASE WHEN ${leads.status} = 'responded' OR ${leads.status} = 'converted' THEN 1 END) * 100.0) / COUNT(${leads.id}), 2)
          ELSE 0 
        END`.as('responseRate'),
        userId: campaigns.userId,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
      })
      .from(campaigns)
      .leftJoin(leads, eq(campaigns.id, leads.campaignId))
      .where(eq(campaigns.id, parseInt(campaignId)))
      .groupBy(campaigns.id, campaigns.name, campaigns.status, campaigns.userId, campaigns.createdAt, campaigns.updatedAt)
      .limit(1);

    if (campaign.length > 0) {
      console.log('Campaign found:', campaign[0].name);
      return NextResponse.json({ campaign: campaign[0] });
    }

    console.log('Campaign not found');
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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
    const updates = await request.json();

    console.log('Campaign Update API - User ID:', user.id);
    console.log('Campaign Update API - Campaign ID:', campaignId);
    console.log('Campaign Update API - Updates:', updates);

    // Update campaign for the current user
    const updatedCampaign = await db
      .update(campaigns)
      .set({
        ...updates,
      })
      .where(and(eq(campaigns.id, parseInt(campaignId)), eq(campaigns.userId, user.id)))
      .returning();

    if (updatedCampaign.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    console.log('Campaign updated successfully:', updatedCampaign[0].name);
    return NextResponse.json({ campaign: updatedCampaign[0] });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    console.log('Campaign Delete API - User ID:', user.id);
    console.log('Campaign Delete API - Campaign ID:', campaignId);

    // Delete campaign for the current user
    const deletedCampaign = await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, parseInt(campaignId)), eq(campaigns.userId, user.id)))
      .returning();

    if (deletedCampaign.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    console.log('Campaign deleted successfully:', deletedCampaign[0].name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
