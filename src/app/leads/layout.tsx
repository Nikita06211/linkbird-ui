import MainLayout from "@/components/layout/MainLayout";

export default function LeadsLayout({
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
