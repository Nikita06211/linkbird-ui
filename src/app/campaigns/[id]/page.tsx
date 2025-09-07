"use client";

import { useState, useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useRouter } from "next/navigation";
import { Campaign, Lead } from "@/lib/api";
import { campaignsApi } from "@/lib/api";

interface CampaignDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user, setUser } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (!userLoading) {
      router.push("/login");
    }
  }, [currentUser, userLoading, setUser, router]);

  // Fetch campaign details
  const {
    data: campaignData,
    error,
    isLoading: campaignLoading,
    isError,
  } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getById(id),
    enabled: !!id,
  });

  const campaign = campaignData?.campaign;

  // Fetch campaign leads
  const {
    data: leadsData,
    error: leadsError,
    isLoading: leadsLoading,
    isError: leadsIsError,
  } = useQuery({
    queryKey: ['campaign-leads', id],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${id}/leads`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaign leads');
      }
      return response.json();
    },
    enabled: !!id && activeTab === 'leads',
  });

  const campaignLeads = leadsData?.leads ?? [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLeadStatusInfo = (status: string) => {
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
          text: "Contacted",
          color: isDark ? "text-orange-400" : "text-orange-600",
          bgColor: isDark ? "bg-orange-900/20" : "bg-orange-100",
        };
      case "responded":
        return {
          text: "Responded",
          color: isDark ? "text-blue-400" : "text-blue-600",
          bgColor: isDark ? "bg-blue-900/20" : "bg-blue-100",
        };
      case "converted":
        return {
          text: "Converted",
          color: isDark ? "text-green-400" : "text-green-600",
          bgColor: isDark ? "bg-green-900/20" : "bg-green-100",
        };
      default:
        return {
          text: "Unknown",
          color: isDark ? "text-gray-400" : "text-gray-600",
          bgColor: isDark ? "bg-gray-900/20" : "bg-gray-100",
        };
    }
  };

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

  const tabs = [
    { 
      id: "overview", 
      label: "Overview", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: "leads", 
      label: "Leads", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      id: "sequence", 
      label: "Sequence", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

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

  if (campaignLoading) {
    return (
      <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="h-screen flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Not Found</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Campaign Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error?.message || 'The campaign you are looking for does not exist.'}
            </p>
            <button
              onClick={() => router.push('/campaigns')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(campaign.status);

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-lg`}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {campaign.name}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Manage and track your campaign performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`flex-1 overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {activeTab === "overview" && (
          <div className="h-full p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Key Metrics Cards */}
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Total Leads
                    </p>
                    <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {campaign.totalLeads}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Successful Leads
                    </p>
                    <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {campaign.totalLeads - (campaign.totalLeads * (100 - campaign.responseRate) / 100)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Response Rate
                    </p>
                    <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {campaign.responseRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Conversion Rate
                    </p>
                    <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      0.0%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Progress */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                Campaign Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Leads Contacted</span>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0.0%</span>
                  </div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div className={`${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'} h-2 rounded-full`} style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Acceptance Rate</span>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0.0%</span>
                  </div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div className={`${theme === 'dark' ? 'bg-green-600' : 'bg-green-400'} h-2 rounded-full`} style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Reply Rate</span>
                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0.0%</span>
                  </div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div className={`${theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-400'} h-2 rounded-full`} style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="flex-1 overflow-hidden flex">
            {/* Leads List */}
            <div className={`flex-1 p-6 ${selectedLead ? 'w-2/3' : 'w-full'} transition-all duration-500 ease-in-out`}>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full flex flex-col`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Campaign Leads
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Manage leads for {campaign.name} ({campaignLeads.length} leads)
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {leadsLoading && (
                  <div className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Loading leads...
                    </p>
                  </div>
                )}

                {leadsIsError && (
                  <div className="px-6 py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      {leadsError?.message || 'Failed to load leads'}
                    </p>
                  </div>
                )}

                {!leadsLoading && !leadsIsError && campaignLeads.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      No leads found
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      This campaign doesn't have any leads yet.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Add Leads
                    </button>
                  </div>
                )}

                {!leadsLoading && !leadsIsError && campaignLeads.length > 0 && (
                  <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {campaignLeads.map((lead: Lead) => {
                      const leadStatusInfo = getLeadStatusInfo(lead.status);
                      
                      return (
                        <div 
                          key={lead.id} 
                          onClick={() => setSelectedLead(lead)}
                          className={`px-6 py-4 ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors cursor-pointer ${
                            selectedLead?.id === lead.id ? (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Lead Avatar */}
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-semibold">
                                {lead.avatarUrl ? (
                                  <img
                                    src={lead.avatarUrl}
                                    alt={lead.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  getInitials(lead.name)
                                )}
                              </span>
                            </div>
                            
                            {/* Lead Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                                    {lead.name}
                                  </p>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                    {lead.designation} at {lead.company}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leadStatusInfo.bgColor} ${leadStatusInfo.color}`}>
                                  {leadStatusInfo.text}
                                </span>
                              </div>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                {lead.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Lead Profile Side Panel */}
            {selectedLead && (
              <div className={`w-1/3 p-6 border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} h-full transition-all duration-500 ease-in-out transform ${selectedLead ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full flex flex-col`}>
                  {/* Lead Profile Header */}
                  <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Lead Profile
                      </h2>
                      <button
                        onClick={() => setSelectedLead(null)}
                        className={`p-1 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
                      >
                        <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className={`px-2 py-1 text-xs rounded-full ${getLeadStatusInfo(selectedLead.status).bgColor} ${getLeadStatusInfo(selectedLead.status).color}`}>
                          {getLeadStatusInfo(selectedLead.status).text}
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
                          {campaign.name}
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

                      <div>
                        <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                          Company
                        </label>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                          {selectedLead.company}
                        </p>
                      </div>

                      <div>
                        <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                          Designation
                        </label>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                          {selectedLead.designation}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Send Message
                      </button>
                      <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sequence" && (
          <div className="h-full p-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full`}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Message Sequence
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Define the message sequence for {campaign.name}
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Request Message */}
                <div>
                  <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Request Message
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    Edit your request message here.
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {['{{fullName}}', '{{firstName}}', '{{lastName}}', '{{jobTitle}}'].map((field) => (
                        <span key={field} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded">
                          {field}
                        </span>
                      ))}
                    </div>
                    <textarea
                      className={`w-full h-32 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Design your message template using the available fields"
                      defaultValue="Hi {{firstName}}, I'm building consultative AI salespersons for personal care brands with the guarantee to boost your D2C revenue by min of 2%. Would love to connect if you're open to exploring this for Just Herbs!"
                    />
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Use {`{{field_name}}`} to insert mapped fields from your Data.
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                          Preview
                        </button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Message */}
                <div>
                  <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Connection Message
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    Edit your connection message here.
                  </p>
                  <div className="space-y-3">
                    <textarea
                      className={`w-full h-32 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Design your connection message template"
                      defaultValue="Awesome to connect, {{firstName}}! Allow me to explain Kandid a bit: So these are consultative salespersons that engage with visitors like an offline store salesperson does. It helps them with product recommendations based on their preferences/concerns. Here's a video to help you visualise it better: https://youtu.be/331X8vg-vPo"
                    />
                    <div className="flex justify-end">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                          Preview
                        </button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="h-full p-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full`}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Campaign Settings
                  </h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Save All Changes
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Campaign Details */}
                <div>
                  <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Campaign Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        defaultValue={campaign.name}
                        className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Campaign Status
                        </label>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Enable or disable this campaign
                        </p>
                      </div>
                      <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in`}>
                        <input type="checkbox" defaultChecked className="sr-only" />
                        <label className={`block overflow-hidden h-6 rounded-full ${campaign.status === 'active' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <span className={`block h-6 w-6 rounded-full bg-white transform transition duration-200 ease-in ${campaign.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`}></span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Request without personalization
                        </label>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Send requests without using personalization fields
                        </p>
                      </div>
                      <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in`}>
                        <input type="checkbox" defaultChecked className="sr-only" />
                        <label className={`block overflow-hidden h-6 rounded-full bg-blue-600`}>
                          <span className={`block h-6 w-6 rounded-full bg-white transform transition duration-200 ease-in translate-x-4`}></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AutoPilot Mode */}
                <div>
                  <h4 className={`text-md font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                    AutoPilot Mode
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Enable AutoPilot
                        </label>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Let the system automatically manage LinkedIn account assignments
                        </p>
                      </div>
                      <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in`}>
                        <input type="checkbox" className="sr-only" />
                        <label className={`block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600`}>
                          <span className={`block h-6 w-6 rounded-full bg-white transform transition duration-200 ease-in translate-x-0`}></span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Selected Accounts
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">JL</span>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Jivesh Lakhani
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              jivesh@kandid.ai
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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
