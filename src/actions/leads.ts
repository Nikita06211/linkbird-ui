"use server";

import { db } from "@/lib/db";
import { leads } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function createLead(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const designation = formData.get('designation') as string;
  const company = formData.get('company') as string;
  const campaignId = formData.get('campaignId') as string;
  const status = formData.get('status') as string;

  if (!name || !email || !designation || !campaignId) {
    throw new Error('Name, email, designation, and campaign are required');
  }

  try {
    await db.insert(leads).values({
      name,
      email,
      designation,
      company: company || null,
      campaignId: parseInt(campaignId),
      status: (status as "pending" | "contacted" | "responded" | "converted") || 'pending',
    });

    revalidatePath('/leads');
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Failed to create lead');
  }
}

export async function updateLead(id: string, formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const designation = formData.get('designation') as string;
  const company = formData.get('company') as string;
  const status = formData.get('status') as string;

  if (!name || !email || !designation) {
    throw new Error('Name, email, and designation are required');
  }

  try {
    await db.update(leads)
      .set({ 
        name,
        email,
        designation,
        company: company || null,
        status: status as "pending" | "contacted" | "responded" | "converted"
      })
      .where(eq(leads.id, parseInt(id)));

    revalidatePath('/leads');
    revalidatePath(`/leads/${id}`);
  } catch (error) {
    console.error('Error updating lead:', error);
    throw new Error('Failed to update lead');
  }
}

export async function deleteLead(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await db.delete(leads).where(eq(leads.id, parseInt(id)));
    revalidatePath('/leads');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw new Error('Failed to delete lead');
  }
}

export async function updateLeadStatus(id: string, status: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await db.update(leads)
      .set({ 
        status: status as "pending" | "contacted" | "responded" | "converted",
        lastContactAt: new Date().toISOString()
      })
      .where(eq(leads.id, parseInt(id)));

    revalidatePath('/leads');
    revalidatePath(`/leads/${id}`);
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Failed to update lead status');
  }
}
