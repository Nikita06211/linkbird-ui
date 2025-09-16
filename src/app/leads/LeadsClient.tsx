"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { useUIStore } from "@/stores/uiStore";
import { useRouter } from "next/navigation";
import { Lead } from "@/lib/api";
import { leadsApi } from "@/lib/api";
import LeadProfileModal from "@/components/leads/LeadProfileModal";
import { createLead, updateLead, deleteLead, updateLeadStatus } from "@/actions/leads";
import CreateLeadModal from "@/components/modals/CreateLeadModal";

interface LeadsClientProps {
  initialLeads: any[];
  initialUser: { id: string; name: string; email: string; image?: string | null };
  searchParams: { status?: string; search?: string; sort?: string };
  totalCount: number;
  hasMore: boolean;
}

export default function LeadsClient({ 
  initialLeads, 
  initialUser, 
  searchParams,
  totalCount: initialTotalCount,
  hasMore: initialHasMore
}: LeadsClientProps) {
  const router = useRouter();
  const { theme, mounted, setMounted } = useThemeStore();
  const queryClient = useQueryClient();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(searchParams.status || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [sortBy, setSortBy] = useState(searchParams.sort || "name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLeadElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  // Use infinite query with initial data from server
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
      
      const response = await fetch(`/api/leads?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }
      
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.leads.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    initialData: {
      pages: [{ leads: initialLeads, totalCount: initialTotalCount, hasMore: initialHasMore }],
      pageParams: [0]
    },
    enabled: true, // Re-enable the query
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  const allLeads = data?.pages.flatMap(page => page.leads) ?? [];
  
  // Deduplicate leads by ID to prevent duplicate keys
  const uniqueLeads = useMemo(() => {
    const seen = new Set();
    const duplicates: string[] = [];
    
    const filtered = allLeads.filter(lead => {
      if (seen.has(lead.id)) {
        duplicates.push(lead.id);
        return false;
      }
      seen.add(lead.id);
      return true;
    });
    
    // Log duplicates for debugging
    if (duplicates.length > 0) {
      console.warn('Found duplicate lead IDs:', duplicates);
    }
    
    return filtered;
  }, [allLeads]);
  
  // Client-side sorting
  const sortedLeads = useMemo(() => {
    return uniqueLeads.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "campaign":
          aValue = a.campaignName?.toLowerCase() || '';
          bValue = b.campaignName?.toLowerCase() || '';
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "activity":
          aValue = a.lastContactAt ? new Date(a.lastContactAt).getTime() : 0;
          bValue = b.lastContactAt ? new Date(b.lastContactAt).getTime() : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [uniqueLeads, sortBy, sortOrder]);
  
  const leads = sortedLeads;

  // Mutations using TanStack Query for optimistic updates
  const createLeadMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; designation: string; company?: string; campaignId: string; status: string }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('designation', data.designation);
      formData.append('company', data.company || '');
      formData.append('campaignId', data.campaignId);
      formData.append('status', data.status);
      await createLead(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; email: string; designation: string; company?: string; status: string } }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('designation', data.designation);
      formData.append('company', data.company || '');
      formData.append('status', data.status);
      await updateLead(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateLeadStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

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

  const handleCreateLead = async (data: { name: string; email: string; designation: string; company?: string; campaignId: string; status: string }) => {
    try {
      await createLeadMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleUpdateLead = async (id: string, data: { name: string; email: string; designation: string; company?: string; status: string }) => {
    try {
      await updateLeadMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLeadMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete lead:', error);
      }
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  if (!mounted) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:space-y-3">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Leads
            </h1>
          </div>
          {/* Mobile Stats */}
          <div className="sm:hidden">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {allLeads.length} leads
            </span>
          </div>
        </div>
            
            {/* Search and Filter Row */}
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Input - Full width on mobile */}
              <div className="relative flex-1 sm:flex-none sm:w-48">
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 pl-8 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Controls Row - Stack on mobile, inline on larger screens */}
              <div className="flex items-center space-x-2">
                {/* Sort Dropdown */}
                <div className="relative flex-1 sm:flex-none sm:w-32">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`appearance-none w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-md px-2 sm:px-3 py-2 pr-6 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="name">Name</option>
                    <option value="campaign">Campaign</option>
                    <option value="status">Status</option>
                    <option value="activity">Activity</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Sort Order Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className={`p-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-md transition-colors`}
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  <svg className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
              
                {/* Filter Dropdown */}
                <div className="relative flex-1 sm:flex-none sm:w-24">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className={`appearance-none w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-md px-2 sm:px-3 py-2 pr-6 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="all">All</option>
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

                {/* Create Lead Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Create Lead</span>
                </button>
              </div>
            </div>
          </div>

      {/* Main Content Area */}
      <div className={`flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Leads List */}
        <div className={`flex-1 p-2 sm:p-4 ${selectedLead ? 'w-full sm:w-2/3' : 'w-full'} transition-all duration-500 ease-in-out`}>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border h-full flex flex-col`}>
              {/* Table Header */}
              <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0 hidden sm:block`}>
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
              <div className="h-[500px] overflow-y-auto">
                {leads.map((lead, index) => {
                  const statusInfo = getStatusInfo(lead.status);
                  const isLast = index === leads.length - 1;
                  
                  return (
                    <div
                      key={`${lead.id}-${index}`}
                      ref={isLast ? lastLeadElementRefCallback : null}
                      onClick={() => setSelectedLead(lead)}
                      className={`px-3 sm:px-4 py-2 sm:py-3 ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer transition-colors border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${
                        selectedLead?.id === lead.id ? (theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                      }`}
                    >
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-start space-x-3">
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
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                                  {lead.name}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                  {lead.designation} at {lead.company}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <span className="text-xs">👤</span>
                                <span className={`text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                {lead.campaignName}
                              </p>
                              <div className="flex space-x-1">
                                {[...Array(4)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-2 ${i < 3 ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'} rounded`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
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
            <div className="hidden sm:block w-1/3 p-4 border-l border-gray-200 dark:border-gray-700">
              <LeadProfileModal 
                lead={selectedLead} 
                onClose={() => setSelectedLead(null)} 
                isMobile={false}
              />
            </div>
          )}

          {/* Mobile Lead Profile Modal */}
          {selectedLead && (
            <div className="sm:hidden">
              <LeadProfileModal 
                lead={selectedLead} 
                onClose={() => setSelectedLead(null)} 
                isMobile={true}
              />
            </div>
          )}

        {/* Create Lead Modal */}
        <CreateLeadModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
