import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-helpers";
import { getLeads } from "@/lib/data/leads";
import LeadsClient from "./LeadsClient";

export default async function LeadsPage({
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
  const leadsData = await getLeads({
    status: resolvedSearchParams.status,
    search: resolvedSearchParams.search,
    sortBy: resolvedSearchParams.sort,
    limit: 20,
    page: 0
  });

  return (
    <LeadsClient 
      initialLeads={leadsData.leads}
      initialUser={session.user}
      searchParams={resolvedSearchParams}
      totalCount={leadsData.totalCount}
      hasMore={leadsData.hasMore}
    />
  );
}