"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useRouter } from "next/navigation";
import { Lead } from "@/lib/api";
import LeadProfileModal from "@/components/leads/LeadProfileModal";

export default function LeadsPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user, setUser, setLoading } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLeadElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (!userLoading) {
      router.push("/login");
    }
  }, [currentUser, userLoading, setUser, router]);

  // Infinite scroll query for leads
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: leadsLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['leads', selectedFilter, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: '20',
        ...(selectedFilter !== 'all' && { status: selectedFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      
      console.log('Fetching leads with params:', params.toString());
      const response = await fetch(`/api/leads?${params}`, {
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Leads data received:', data);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.leads.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  const leads = data?.pages.flatMap(page => page.leads) ?? [];

  // Intersection Observer for infinite scroll
  const lastLeadElementRefCallback = useCallback((node: HTMLDivElement) => {
    if (leadsLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [leadsLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusInfo = (status: string) => {
    const isDark = theme === 'dark';
    switch (status) {
      case "pending":
        return {
          text: "Pending",
          color: isDark ? "text-purple-400" : "text-purple-600",
          bgColor: isDark ? "bg-purple-900/20" : "bg-purple-100",
        };
      case "contacted":
        return {
          text: "Sent 7 mins ago",
          color: isDark ? "text-orange-400" : "text-orange-600",
          bgColor: isDark ? "bg-orange-900/20" : "bg-orange-100",
        };
      case "responded":
        return {
          text: "Followup 10 mins ago",
          color: isDark ? "text-blue-400" : "text-blue-600",
          bgColor: isDark ? "bg-blue-900/20" : "bg-blue-100",
        };
      case "converted":
        return {
          text: "Do Not Contact",
          color: isDark ? "text-gray-400" : "text-gray-600",
          bgColor: isDark ? "bg-gray-900/20" : "bg-gray-100",
        };
      default:
        return {
          text: "Unknown",
          color: isDark ? "text-gray-400" : "text-gray-600",
          bgColor: isDark ? "bg-gray-900/20" : "bg-gray-100",
        };
    }
  };

  const isUserLoading = userLoading;

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Small Header with Search */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Leads
          </h1>
          
          {/* Search and Filter */}
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-48 px-3 py-1.5 pl-8 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`appearance-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-md px-3 py-1.5 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="all">All Leads</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="responded">Responded</option>
                <option value="converted">Converted</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-hidden flex my-20 mx-25 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Leads List */}
        <div className={`flex-1 p-4 ${selectedLead ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full flex flex-col`}>
            {/* Table Header */}
            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <h3 className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Name
                  </h3>
                </div>
                <div className="col-span-4">
                  <h3 className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Campaign Name
                  </h3>
                </div>
                <div className="col-span-2">
                  <h3 className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Activity
                  </h3>
                </div>
                <div className="col-span-1">
                  <h3 className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </h3>
                </div>
              </div>
            </div>

            {/* Leads List */}
            <div className="flex-1 overflow-y-auto">
              {leads.map((lead, index) => {
                const statusInfo = getStatusInfo(lead.status);
                const isLast = index === leads.length - 1;
                
                return (
                  <div
                    key={lead.id}
                    ref={isLast ? lastLeadElementRefCallback : null}
                    onClick={() => setSelectedLead(lead)}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                      selectedLead?.id === lead.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name Column */}
                      <div className="col-span-5 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {lead.avatarUrl ? (
                              <img
                                src={lead.avatarUrl}
                                alt={lead.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              getInitials(lead.name)
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                            {lead.name}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                            {lead.designation} at {lead.company}
                          </p>
                        </div>
                      </div>

                      {/* Campaign Name Column */}
                      <div className="col-span-4">
                        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                          {lead.campaignName}
                        </p>
                      </div>

                      {/* Activity Column */}
                      <div className="col-span-2">
                        <div className="flex space-x-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-3 ${i < 3 ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'} rounded`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Status Column */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">👤</span>
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading States */}
              {leadsLoading && (
                <div className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Loading leads...
                  </p>
                </div>
              )}

              {isError && (
                <div className="px-4 py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {error?.message || 'Failed to load leads'}
                  </p>
                </div>
              )}

              {!leadsLoading && !isError && leads.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No leads found</p>
              </div>
            )}

            {/* Load More Indicator */}
            {isFetchingNextPage && (
              <div className="px-4 py-3 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Loading more leads...
                </p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Lead Profile Side Panel */}
        {selectedLead && (
          <div className="w-1/3 p-4 border-l border-gray-200 dark:border-gray-700">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full flex flex-col`}>
              {/* Lead Profile Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Lead Profile
                  </h2>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Lead Profile Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl font-semibold">
                      {selectedLead.avatarUrl ? (
                        <img
                          src={selectedLead.avatarUrl}
                          alt={selectedLead.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(selectedLead.name)
                      )}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedLead.name}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedLead.designation} at {selectedLead.company}
                  </p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(selectedLead.status).bgColor} ${getStatusInfo(selectedLead.status).color}`}>
                      {getStatusInfo(selectedLead.status).text}
                    </span>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-4">
                  <div>
                    <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Email
                    </label>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {selectedLead.email}
                    </p>
                  </div>

                  <div>
                    <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Campaign
                    </label>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {selectedLead.campaignName}
                    </p>
                  </div>

                  <div>
                    <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Last Contact
                    </label>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {selectedLead.lastContactAt ? new Date(selectedLead.lastContactAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}