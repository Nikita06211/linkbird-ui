import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getAuthSession() {
  try {
    const headersList = await headers();
    
    // Create a proper Headers object with fallback
    let safeHeaders: Headers;
    
    if (headersList && typeof headersList === 'object') {
      // Convert ReadonlyHeaders to Headers if needed
      safeHeaders = new Headers();
      if (headersList.entries) {
        for (const [key, value] of headersList.entries()) {
          safeHeaders.set(key, value);
        }
      }
    } else {
      // Fallback to empty Headers
      safeHeaders = new Headers();
    }
    
    const session = await auth.api.getSession({
      headers: safeHeaders,
    });
    
    return session;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}
