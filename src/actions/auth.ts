"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signOut() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('No active session');
  }

  try {
    const headersList = await headers();
    await auth.api.signOut({
      headers: headersList || new Headers(),
    });
    
    redirect('/login');
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out');
  }
}

export async function getCurrentUser() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}
