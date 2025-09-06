"use client";

import { useState } from "react";
import { useCampaigns } from "@/hooks/queries/useCampaigns";
import { useThemeStore } from "@/stores/themeStore";

export default function CampaignsList() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { data: campaigns = [], isLoading: loading, error } = useCampaigns(selectedFilter === "all" ? undefined : selectedFilter);
  const { theme } = useThemeStore();

  const getStatusColor = (status: string) => {
    const isDark = theme === 'dark';
    switch (status) {
      case "active":
        return isDark ? "bg-green-900/20 text-green-400" : "bg-green-100 text-green-800";
      case "draft":
        return isDark ? "bg-gray-900/20 text-gray-400" : "bg-gray-100 text-gray-800";
      case "paused":
        return isDark ? "bg-yellow-900/20 text-yellow-400" : "bg-yellow-100 text-yellow-800";
      case "completed":
        return isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-100 text-blue-800";
      default:
        return isDark ? "bg-gray-900/20 text-gray-400" : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Campaigns</h2>
        <div className="relative">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={`appearance-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex-1">
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/3 mb-2`}></div>
                  <div className="flex space-x-4">
                    <div className={`h-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded w-16`}></div>
                    <div className={`h-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded w-20`}></div>
                  </div>
                </div>
                <div className={`h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full w-16`}></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 dark:text-red-400 text-sm">{error?.message || 'An error occurred'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors cursor-pointer`}
            >
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {campaign.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {campaign.totalLeads} leads
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {campaign.responseRate}% response
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No campaigns found</p>
        </div>
      )}
    </div>
  );
}
