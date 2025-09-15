import { NextRequest, NextResponse } from "next/server";
import { getLeads } from "@/lib/data/leads";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '0');
    
    const leadsData = await getLeads({
      status,
      search,
      sortBy,
      sortOrder,
      limit,
      page
    });
    
    return NextResponse.json(leadsData);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}