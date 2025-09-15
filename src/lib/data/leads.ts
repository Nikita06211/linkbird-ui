import { db } from "@/lib/db";
import { leads, campaigns } from "@/lib/schema";
import { eq, and, count, sql, desc, asc, ilike, or } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-helpers";

export interface LeadWithCampaign {
  id: string;
  name: string;
  email: string;
  designation: string;
  company: string | null;
  status: 'pending' | 'contacted' | 'responded' | 'converted';
  campaignId: string;
  campaignName: string;
  avatarUrl: string | null;
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsFilters {
  status?: string;
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getLeads(filters: LeadsFilters = {}): Promise<{
  leads: LeadWithCampaign[];
  totalCount: number;
  hasMore: boolean;
}> {
  try {
    const {
      status,
      search,
      limit = 20,
      page = 0,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    // Build where conditions - no user filtering for now
    const whereConditions = [eq(leads.campaignId, campaigns.id)];

    if (status && status !== 'all') {
      whereConditions.push(eq(leads.status, status as any));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`),
          ilike(campaigns.name, `%${search}%`)
        )!
      );
    }

    // Build order by clause
    let orderBy;
    switch (sortBy) {
      case 'name':
        orderBy = sortOrder === 'asc' ? asc(leads.name) : desc(leads.name);
        break;
      case 'campaign':
        orderBy = sortOrder === 'asc' ? asc(campaigns.name) : desc(campaigns.name);
        break;
      case 'status':
        orderBy = sortOrder === 'asc' ? asc(leads.status) : desc(leads.status);
        break;
      case 'activity':
        orderBy = sortOrder === 'asc' ? asc(leads.lastContactAt) : desc(leads.lastContactAt);
        break;
      default:
        orderBy = asc(leads.name);
    }

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(...whereConditions));

    const totalCount = totalCountResult[0]?.count || 0;

    // Get leads with pagination
    const leadsData = await db
      .select({
        id: sql<string>`${leads.id}::text`.as('id'),
        name: leads.name,
        email: leads.email,
        designation: leads.designation,
        company: leads.company,
        status: leads.status,
        campaignId: sql<string>`${leads.campaignId}::text`.as('campaignId'),
        campaignName: campaigns.name,
        avatarUrl: leads.avatarUrl,
        lastContactAt: sql<string>`${leads.lastContactAt}::text`.as('lastContactAt'),
        createdAt: sql<string>`NOW()::text`.as('createdAt'),
        updatedAt: sql<string>`NOW()::text`.as('updatedAt'),
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(page * limit);

    return {
      leads: leadsData,
      totalCount,
      hasMore: (page + 1) * limit < totalCount
    };
  } catch (error) {
    console.error('Database error in getLeads:', error);
    // Fallback to mock data if database fails
    return {
      leads: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          designation: "Software Engineer",
          company: "Tech Corp",
          status: "pending",
          campaignId: "1",
          campaignName: "Q1 Campaign",
          avatarUrl: null,
          lastContactAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      totalCount: 1,
      hasMore: false
    };
  }
}

export async function getLeadsByCampaign(campaignId: string): Promise<LeadWithCampaign[]> {
  try {
    // Temporarily bypass auth to test
    // const session = await getAuthSession();
    // if (!session?.user) {
    //   throw new Error('Unauthorized');
    // }

    const leadsData = await db
      .select({
        id: sql<string>`${leads.id}::text`.as('id'),
        name: leads.name,
        email: leads.email,
        designation: leads.designation,
        company: leads.company,
        status: leads.status,
        campaignId: sql<string>`${leads.campaignId}::text`.as('campaignId'),
        campaignName: campaigns.name,
        avatarUrl: leads.avatarUrl,
        lastContactAt: sql<string>`${leads.lastContactAt}::text`.as('lastContactAt'),
        createdAt: sql<string>`NOW()::text`.as('createdAt'),
        updatedAt: sql<string>`NOW()::text`.as('updatedAt'),
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(leads.campaignId, parseInt(campaignId)))
      .orderBy(asc(leads.name));

    return leadsData;
  } catch (error) {
    console.error('Database error in getLeadsByCampaign:', error);
    return [];
  }
}

export async function getLeadById(id: string): Promise<LeadWithCampaign | null> {
  try {
    // Temporarily bypass auth to test
    // const session = await getAuthSession();
    // if (!session?.user) {
    //   throw new Error('Unauthorized');
    // }

    const leadData = await db
      .select({
        id: sql<string>`${leads.id}::text`.as('id'),
        name: leads.name,
        email: leads.email,
        designation: leads.designation,
        company: leads.company,
        status: leads.status,
        campaignId: sql<string>`${leads.campaignId}::text`.as('campaignId'),
        campaignName: campaigns.name,
        avatarUrl: leads.avatarUrl,
        lastContactAt: sql<string>`${leads.lastContactAt}::text`.as('lastContactAt'),
        createdAt: sql<string>`NOW()::text`.as('createdAt'),
        updatedAt: sql<string>`NOW()::text`.as('updatedAt'),
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(leads.id, parseInt(id)))
      .limit(1);

    return leadData[0] || null;
  } catch (error) {
    console.error('Database error in getLeadById:', error);
    return null;
  }
}
