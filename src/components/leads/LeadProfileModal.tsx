"use client";

import { useState } from "react";
import { Lead } from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";

interface LeadProfileModalProps {
  lead: Lead;
  onClose: () => void;
}

export default function LeadProfileModal({ lead, onClose }: LeadProfileModalProps) {
  const { theme } = useThemeStore();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true);

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

  const statusInfo = getStatusInfo(lead.status);

  // Mock activity timeline data
  const activities = [
    {
      id: 1,
      type: "invitation",
      status: "completed",
      message: "Hi Dilbag, I'm building consultative... See More",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "connection",
      status: "pending",
      message: "Check connection status",
      time: "1 hour ago"
    },
    {
      id: 3,
      type: "reply",
      status: "completed",
      message: "Awesome to connect, Dilbag! Allow me... See More",
      time: "45 mins ago"
    },
    {
      id: 4,
      type: "followup",
      status: "pending",
      message: "Hey, did you get a chance to go thro... See More",
      time: "30 mins ago"
    },
    {
      id: 5,
      type: "followup",
      status: "pending",
      message: "Hi Dilbag just following up on my m... See More",
      time: "15 mins ago"
    }
  ];

  const getActivityIcon = (type: string, status: string) => {
    if (status === "completed") {
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      );
    }
  };

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Lead Profile
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            title="Delete Lead"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lead Info */}
      <div className="px-6 py-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              {lead.avatarUrl ? (
                <img
                  src={lead.avatarUrl}
                  alt={lead.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                getInitials(lead.name)
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {lead.name}
            </h3>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
          
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            {lead.designation} at {lead.company}
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {lead.campaignName}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* Additional Profile Info */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
            className={`w-full flex items-center justify-between p-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Additional Profile Info
            </span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showAdditionalInfo ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdditionalInfo && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JL</span>
                </div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Jivesh Lakhani
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {lead.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div>
          <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Activity Timeline
          </h4>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  {getActivityIcon(activity.type, activity.status)}
                  {index < activities.length - 1 && (
                    <div className={`w-0.5 h-8 mt-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {activity.message}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Status Summary */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              No reply from lead
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

