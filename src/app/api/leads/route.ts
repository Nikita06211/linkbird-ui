import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, campaigns } from "@/lib/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("Leads API called");
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log("Session:", session ? "Found" : "Not found");
    console.log("User:", session?.user ? session.user.id : "No user");

    if (!session?.user) {
      console.log("No session, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '0');
    const search = searchParams.get('search');

    // Build query for leads - get all leads for the user's campaigns
    const conditions = [eq(campaigns.userId, user.id)];

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
          ilike(leads.designation, `%${search}%`),
          ilike(campaigns.name, `%${search}%`)
        )!
      );
    }

    const whereCondition = and(...conditions);
    const offset = page * limit;

    // First try to get leads for the current user
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
      .limit(limit)
      .offset(offset);

    console.log("User leads found:", userLeads.length);
    console.log("User leads data:", JSON.stringify(userLeads, null, 2));

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
        .limit(limit)
        .offset(offset);
      
      console.log('Test user leads found:', testUserLeads.length);
      console.log('Test user leads data:', JSON.stringify(testUserLeads, null, 2));
      return NextResponse.json({ leads: testUserLeads });
    }

    return NextResponse.json({ leads: userLeads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}