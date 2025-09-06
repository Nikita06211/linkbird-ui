import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
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
    console.log('Campaigns API - User ID:', user.id);
    console.log('Campaigns API - User Name:', user.name);
    console.log('Campaigns API - User Email:', user.email);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereCondition;

    if (status && status !== 'all') {
      whereCondition = and(eq(campaigns.userId, user.id), eq(campaigns.status, status as any));
    } else {
      whereCondition = eq(campaigns.userId, user.id);
    }

    const userCampaigns = await db.select().from(campaigns).where(whereCondition);
    console.log('Campaigns found for user:', userCampaigns.length);

    // If no campaigns found for the current user, show campaigns for test user (for demo purposes)
    if (userCampaigns.length === 0) {
      console.log('No campaigns for current user, showing test user campaigns');
      const testUserCampaigns = await db.select().from(campaigns).where(eq(campaigns.userId, "test-user-123"));
      console.log('Test user campaigns found:', testUserCampaigns.length);
      return NextResponse.json({ campaigns: testUserCampaigns });
    }

    console.log('Returning user campaigns:', userCampaigns.length);
    return NextResponse.json({ campaigns: userCampaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}