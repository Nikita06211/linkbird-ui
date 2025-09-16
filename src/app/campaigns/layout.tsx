import MainLayout from "@/components/layout/MainLayout";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
