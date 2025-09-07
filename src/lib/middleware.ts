import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: { id: string; name: string; email: string }) => Promise<NextResponse> | NextResponse
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return handler(request, session.user);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session?.user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
