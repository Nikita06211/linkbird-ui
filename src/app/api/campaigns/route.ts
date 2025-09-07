import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, leads } from "@/lib/schema";
import { eq, and, count, sql } from "drizzle-orm";
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
      whereCondition = and(eq(campaigns.userId, user.id), eq(campaigns.status, status as "draft" | "active" | "paused" | "completed"));
    } else {
      whereCondition = eq(campaigns.userId, user.id);
    }

    // Get campaigns with actual lead counts
    const userCampaigns = await db
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
      })
      .from(campaigns)
      .leftJoin(leads, eq(campaigns.id, leads.campaignId))
      .where(whereCondition)
      .groupBy(campaigns.id, campaigns.name, campaigns.status, campaigns.userId, campaigns.createdAt);

    console.log('Campaigns found for user:', userCampaigns.length);

    // If no campaigns found for the current user, show campaigns for test user (for demo purposes)
    if (userCampaigns.length === 0) {
      console.log('No campaigns for current user, showing test user campaigns');
      const testUserCampaigns = await db
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
        })
        .from(campaigns)
        .leftJoin(leads, eq(campaigns.id, leads.campaignId))
        .where(eq(campaigns.userId, "test-user-123"))
        .groupBy(campaigns.id, campaigns.name, campaigns.status, campaigns.userId, campaigns.createdAt);
      
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