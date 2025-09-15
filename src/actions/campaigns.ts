"use server";

import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function createCampaign(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const status = formData.get('status') as string;

  if (!name) {
    throw new Error('Campaign name is required');
  }

  try {
    await db.insert(campaigns).values({
      name,
      status: (status as "draft" | "active" | "paused" | "completed") || 'draft',
      userId: session.user.id,
    });

    revalidatePath('/campaigns');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw new Error('Failed to create campaign');
  }
}

export async function updateCampaign(id: string, formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const status = formData.get('status') as string;

  if (!name) {
    throw new Error('Campaign name is required');
  }

  try {
    await db.update(campaigns)
      .set({ 
        name, 
        status: status as "draft" | "active" | "paused" | "completed"
      })
      .where(eq(campaigns.id, parseInt(id)));

    revalidatePath('/campaigns');
    revalidatePath(`/campaigns/${id}`);
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw new Error('Failed to update campaign');
  }
}

export async function deleteCampaign(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await db.delete(campaigns).where(eq(campaigns.id, parseInt(id)));
    revalidatePath('/campaigns');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw new Error('Failed to delete campaign');
  }
}

export async function updateCampaignStatus(id: string, status: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList || new Headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await db.update(campaigns)
      .set({ status: status as "draft" | "active" | "paused" | "completed" })
      .where(eq(campaigns.id, parseInt(id)));

    revalidatePath('/campaigns');
    revalidatePath(`/campaigns/${id}`);
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error updating campaign status:', error);
    throw new Error('Failed to update campaign status');
  }
}
