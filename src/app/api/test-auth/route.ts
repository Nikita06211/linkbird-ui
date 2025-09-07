import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Test if auth is properly configured
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return NextResponse.json({
      success: true,
      message: "Auth configuration is working",
      session: session ? "Session found" : "No session",
      env: {
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasBaseUrl: !!process.env.BETTER_AUTH_URL,
        baseUrl: process.env.BETTER_AUTH_URL,
      }
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
