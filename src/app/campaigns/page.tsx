"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useRouter } from "next/navigation";
import { Campaign } from "@/lib/api";
import { campaignsApi } from "@/lib/api";

export default function CampaignsPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user, setUser } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (!userLoading) {
      router.push("/login");
    }
  }, [currentUser, userLoading, setUser, router]);

  // Fetch campaigns
  const {
    data: campaignsData,
    error,
    isLoading: campaignsLoading,
    isError,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.getAll(),
  });

  const campaigns = campaignsData?.campaigns ?? [];

  const getStatusInfo = (status: string) => {
    const isDark = theme === 'dark';
    switch (status) {
      case "active":
        return {
          text: "Active",
          color: isDark ? "text-green-400" : "text-green-600",
          bgColor: isDark ? "bg-green-900/20" : "bg-green-100",
        };
      case "draft":
        return {
          text: "Draft",
          color: isDark ? "text-yellow-400" : "text-yellow-600",
          bgColor: isDark ? "bg-yellow-900/20" : "bg-yellow-100",
        };
      case "paused":
        return {
          text: "Paused",
          color: isDark ? "text-orange-400" : "text-orange-600",
          bgColor: isDark ? "bg-orange-900/20" : "bg-orange-100",
        };
      case "completed":
        return {
          text: "Completed",
          color: isDark ? "text-blue-400" : "text-blue-600",
          bgColor: isDark ? "bg-blue-900/20" : "bg-blue-100",
        };
      default:
        return {
          text: "Unknown",
          color: isDark ? "text-gray-400" : "text-gray-600",
          bgColor: isDark ? "bg-gray-900/20" : "bg-gray-100",
        };
    }
  };

  const filteredAndSortedCampaigns = campaigns
    .filter(campaign => {
      // Filter by search query
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = selectedFilter === 'all' || campaign.status === selectedFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "leads":
          aValue = a.totalLeads;
          bValue = b.totalLeads;
          break;
        case "responseRate":
          aValue = a.responseRate;
          bValue = b.responseRate;
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

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
      {/* Header */}
      <div className={`px-4 sm:px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Campaigns
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Manage your campaigns and track their performance
              {filteredAndSortedCampaigns.length !== campaigns.length && (
                <span className="ml-2">
                  ({filteredAndSortedCampaigns.length} of {campaigns.length} campaigns)
                </span>
              )}
            </p>
          </div>
          
          <button
            onClick={() => router.push('/campaigns/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
          >
            + Create Campaign
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`px-4 sm:px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
        <div className="flex flex-col space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 pl-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none w-full sm:w-auto ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="leads">Sort by Leads</option>
                <option value="responseRate">Sort by Response Rate</option>
                <option value="created">Sort by Created Date</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`p-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
            
            {/* Filter Tabs */}
            <div className={`flex flex-wrap gap-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-1`}>
              {[
                { key: 'all', label: 'All Campaigns' },
                { key: 'active', label: 'Active' },
                { key: 'draft', label: 'Draft' },
                { key: 'paused', label: 'Paused' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedFilter === filter.key
                      ? `${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} shadow-sm`
                      : `${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-hidden p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full`}>
          {/* Table Header */}
          <div className={`px-4 sm:px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hidden sm:block`}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Campaign Name
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Status
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Total Leads
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Response Rate
                </h3>
              </div>
              <div className="col-span-2">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Created
                </h3>
              </div>
            </div>
          </div>

          {/* Campaigns List */}
          <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} max-h-96 overflow-y-auto`}>
            {campaignsLoading && (
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Loading campaigns...
                </p>
              </div>
            )}

            {isError && (
              <div className="px-6 py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 dark:text-red-400 text-sm">
                  {error?.message || 'Failed to load campaigns'}
                </p>
              </div>
            )}

            {!campaignsLoading && !isError && filteredAndSortedCampaigns.length === 0 && (
              <div className="px-6 py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedFilter === 'all' ? 'No campaigns found' : `No ${selectedFilter} campaigns found`}
                </p>
                {selectedFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Show all campaigns
                  </button>
                )}
              </div>
            )}

            {filteredAndSortedCampaigns.map((campaign) => {
              const statusInfo = getStatusInfo(campaign.status);
              
              return (
                <div
                  key={campaign.id}
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  className={`px-4 sm:px-6 py-4 ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                            {campaign.name}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} ml-2`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          Campaign
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {campaign.totalLeads} leads
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {campaign.responseRate}% response
                            </span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                    {/* Campaign Name */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                            {campaign.name}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Campaign
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>

                    {/* Total Leads */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {campaign.totalLeads}
                        </span>
                      </div>
                    </div>

                    {/* Response Rate */}
                    <div className="col-span-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {campaign.responseRate}%
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
