"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { theme, mounted, setMounted } = useThemeStore();
  const { user, setUser, logout, initialize } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: currentUser, isLoading: userLoading, isError } = useCurrentUser();

  useEffect(() => {
    setMounted(true);
    // Initialize auth store from persisted data
    initialize();
  }, [setMounted, initialize]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (isError) {
      // Only redirect if there's an actual error, not just loading
      router.push("/login");
    }
  }, [currentUser, isError, setUser, router]);

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

  // Only show loading if we don't have user data AND we're actually loading
  const isLoading = userLoading && !user;

  

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`sm:hidden p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                LinkBird
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

        {(isLoading || !mounted) ? (
          <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
            </div>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        )}
        
      </div>
    </div>
  );
}
