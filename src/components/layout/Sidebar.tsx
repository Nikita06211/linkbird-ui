"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(!isCollapsed);
    }
  }, [isCollapsed, isMobile]);

  const handleToggle = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
    onToggle();
  };

  const handleClose = () => {
    if (isMobile) {
      setIsOpen(false);
      onToggle();
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigationItems = [
    { name: "Dashboard", icon: "home", href: "/dashboard" },
    { name: "Leads", icon: "users", href: "/leads" },
    { name: "Campaigns", icon: "target", href: "/campaigns" },
    { name: "Messages", icon: "mail", href: "/messages", badge: "10+" },
    { name: "LinkedIn Accounts", icon: "briefcase", href: "/linkedin" },
  ];

  const settingsItems = [
    { name: "Settings & Billing", icon: "settings", href: "/settings" },
  ];

  const adminItems = [
    { name: "Activity Logs", icon: "file-text", href: "/activity" },
    { name: "User Logs", icon: "users", href: "/users" },
  ];

  const renderIcon = (iconName: string) => {
    const iconClass = `w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`;
    
    switch (iconName) {
      case "home":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "users":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case "target":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "mail":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "briefcase":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        );
      case "settings":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "file-text":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return <span className={iconClass}>?</span>;
    }
  };

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`fixed left-0 top-0 h-screen z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r w-64 flex flex-col`}>
          {renderSidebarContent()}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col h-screen fixed left-0 top-0 z-50`}>
      {renderSidebarContent()}
    </div>
  );

  function renderSidebarContent() {
    return (
      <>
        {/* Header */}
        <div className={`p-3 sm:p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">LB</span>
                </div>
                <span className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>LinkBird</span>
              </div>
            )}
            <button
              onClick={handleToggle}
              className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className={`p-3 sm:p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm sm:text-base font-semibold">PE</span>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1">
                <p className={`text-sm sm:text-md font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>Kandid</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Personal</p>
              </div>
            )}
            {(!isCollapsed || isMobile) && (
              <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={isMobile ? handleClose : undefined}
                    className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors ${
                      isActive
                        ? `${theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`
                        : `${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-400'}`
                    }`}
                  >
                    {renderIcon(item.icon)}
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <span className={`ml-auto ${theme === 'dark' ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'} text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Settings Section */}
            <div className="mt-6 sm:mt-8">
              <h3 className={`px-2 sm:px-3 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-2`}>
                {(!isCollapsed || isMobile) && "Settings"}
              </h3>
              <div className="space-y-1">
                {settingsItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={isMobile ? handleClose : undefined}
                    className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-400'} transition-colors`}
                  >
                    {renderIcon(item.icon)}
                    {(!isCollapsed || isMobile) && <span className="text-xs sm:text-sm font-medium">{item.name}</span>}
                  </a>
                ))}
              </div>
            </div>

            {/* Admin Section */}
            <div className="mt-4 sm:mt-6">
              <h3 className={`px-2 sm:px-3 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-2`}>
                {(!isCollapsed || isMobile) && "Admin Panel"}
              </h3>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={isMobile ? handleClose : undefined}
                    className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'} ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-400'} transition-colors`}
                  >
                    {renderIcon(item.icon)}
                    {(!isCollapsed || isMobile) && <span className="text-xs sm:text-sm font-medium">{item.name}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Theme Toggle */}
        <div className={`p-3 sm:p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobile) && (
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Theme</span>
            )}
            <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }
}
