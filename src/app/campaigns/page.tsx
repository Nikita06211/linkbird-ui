import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-helpers";
import { getCampaigns } from "@/lib/data/campaigns";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; sort?: string }>;
}) {
  // Temporarily bypass auth to test
  // const session = await getAuthSession();
  // if (!session?.user) {
  //   redirect('/login');
  // }
  
  // Mock user for testing
  const session = { user: { id: "test-user-123", name: "Test User", email: "test@example.com" } };

  // Await searchParams before using
  const resolvedSearchParams = await searchParams;

  // Server-side data fetching
  const initialCampaigns = await getCampaigns(resolvedSearchParams.status);

  return (
    <CampaignsClient 
      initialCampaigns={initialCampaigns}
      initialUser={session.user}
      searchParams={resolvedSearchParams}
    />
  );
}

