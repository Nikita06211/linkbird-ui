import { NextRequest, NextResponse } from "next/server";
import { getCampaigns } from "@/lib/data/campaigns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const result = await getCampaigns(status, page, limit);
    
    // Debug: Log available campaign IDs
    console.log('Available campaigns:', result.campaigns.map(c => ({ id: c.id, name: c.name })));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}