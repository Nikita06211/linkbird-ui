import MainLayout from "@/components/layout/MainLayout";
import CampaignsList from "@/components/dashboard/CampaignsList";
import LeadsList from "@/components/dashboard/LeadsList";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Campaigns Section */}
        <div className="space-y-4 sm:space-y-6">
          <CampaignsList />
        </div>

        {/* Leads Section */}
        <div className="space-y-4 sm:space-y-6">
          <LeadsList />
        </div>
      </div>
    </MainLayout>
  );
}
