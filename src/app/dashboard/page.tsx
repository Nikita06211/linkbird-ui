"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import CampaignsList from "@/components/dashboard/CampaignsList";
import LeadsList from "@/components/dashboard/LeadsList";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { theme, mounted, setMounted } = useThemeStore();
  const { user, setUser, setLoading, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (!userLoading) {
      router.push("/login");
    }
  }, [currentUser, userLoading, setUser, router]);

  const handleSignOut = async () => {
    try {
      // Clear the auth store
      logout();
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const isLoading = userLoading;

  if (isLoading || !mounted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg md:hidden`}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                  />
                )}
                <span className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} hidden sm:block`}>{user?.name}</span>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  theme === 'dark' 
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500' 
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                }`}
                title="Sign out"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
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
        </main>
      </div>
    </div>
  );
}
