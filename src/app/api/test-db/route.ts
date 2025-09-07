import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

export async function GET() {
  try {
    // Test database connection
    const users = await db.select().from(user).limit(1);
    
    return NextResponse.json({
      success: true,
      message: "Database connection is working",
      userCount: users.length,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
