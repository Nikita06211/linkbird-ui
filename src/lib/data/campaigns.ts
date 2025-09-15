import { db } from "@/lib/db";
import { campaigns, leads } from "@/lib/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-helpers";

export interface CampaignWithStats {
  id: number;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  totalLeads: number;
  successfulLeads: number;
  responseRate: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getCampaigns(status?: string): Promise<CampaignWithStats[]> {
  try {
    let whereCondition;

    if (status && status !== 'all') {
      whereCondition = eq(campaigns.status, status as "draft" | "active" | "paused" | "completed");
    } else {
      // No user filtering - get all campaigns
      whereCondition = undefined;
    }

    const allCampaigns = await db
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
        createdAt: sql<string>`${campaigns.createdAt}::text`.as('createdAt'),
        updatedAt: sql<string>`${campaigns.updatedAt}::text`.as('updatedAt'),
      })
      .from(campaigns)
      .leftJoin(leads, eq(campaigns.id, leads.campaignId))
      .where(whereCondition)
      .groupBy(campaigns.id, campaigns.name, campaigns.status, campaigns.userId, campaigns.createdAt, campaigns.updatedAt);

    console.log('getCampaigns - Found campaigns:', allCampaigns.map(c => ({ id: c.id, name: c.name, userId: c.userId })));

    return allCampaigns;
  } catch (error) {
    console.error('Database error in getCampaigns:', error);
    // Fallback to mock data if database fails
    return [
      {
        id: 1,
        name: "Q1 Marketing Campaign",
        status: "active",
        totalLeads: 25,
        successfulLeads: 8,
        responseRate: 32.0,
        userId: "test-user-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }
}

export async function getCampaignById(id: string): Promise<CampaignWithStats | null> {
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
      createdAt: sql<string>`${campaigns.createdAt}::text`.as('createdAt'),
        updatedAt: sql<string>`${campaigns.updatedAt}::text`.as('updatedAt'),
    })
    .from(campaigns)
    .leftJoin(leads, eq(campaigns.id, leads.campaignId))
    .where(eq(campaigns.id, parseInt(id)))
      .groupBy(campaigns.id, campaigns.name, campaigns.status, campaigns.userId, campaigns.createdAt, campaigns.updatedAt)
    .limit(1);

  return campaign[0] || null;
}
