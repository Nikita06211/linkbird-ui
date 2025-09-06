"use client";

import { useThemeStore } from "@/stores/themeStore";
import { useUIStore } from "@/stores/uiStore";
import Sidebar from "@/components/layout/Sidebar";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <div className={`h-screen flex bg-white dark:bg-gray-900 overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
