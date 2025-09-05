import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/schema";

export async function GET() {
  try {
    const allLeads = await db.select().from(leads);
    return NextResponse.json(allLeads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
