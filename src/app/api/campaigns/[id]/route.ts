import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
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

    console.log('Campaign Details API - User ID:', user.id);
    console.log('Campaign Details API - Campaign ID:', campaignId);

    // First try to get campaign for the current user
    const userCampaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, parseInt(campaignId)), eq(campaigns.userId, user.id)))
      .limit(1);

    if (userCampaign.length > 0) {
      console.log('Campaign found for user:', userCampaign[0].name);
      return NextResponse.json({ campaign: userCampaign[0] });
    }

    // If no campaign found for the current user, try test user (for demo purposes)
    console.log('No campaign for current user, checking test user');
    const testUserCampaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, parseInt(campaignId)), eq(campaigns.userId, "test-user-123")))
      .limit(1);

    if (testUserCampaign.length > 0) {
      console.log('Campaign found for test user:', testUserCampaign[0].name);
      return NextResponse.json({ campaign: testUserCampaign[0] });
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
    const updates = await request.json();

    console.log('Campaign Update API - User ID:', user.id);
    console.log('Campaign Update API - Campaign ID:', campaignId);
    console.log('Campaign Update API - Updates:', updates);

    // Update campaign for the current user
    const updatedCampaign = await db
      .update(campaigns)
      .set({
        ...updates,
        updatedAt: new Date(),
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
