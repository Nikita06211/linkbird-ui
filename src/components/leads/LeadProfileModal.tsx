"use client";

import { useState, useEffect } from "react";
import { Lead } from "@/lib/api";
import { useThemeStore } from "@/stores/themeStore";

interface LeadProfileModalProps {
  lead: Lead;
  onClose: () => void;
  isMobile?: boolean;
}

export default function LeadProfileModal({ lead, onClose, isMobile = false }: LeadProfileModalProps) {
  const { theme } = useThemeStore();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

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

  // Mobile overlay
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className={`absolute inset-x-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-xl transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Lead Profile
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
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

          {/* Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop side panel
  return (
    <div className={`w-full sm:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen overflow-y-auto transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <h2 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Lead Profile
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClose}
            className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            title="Close"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            title="Delete Lead"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );

  function renderContent() {
    return (
      <>

        {/* Lead Info */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-white text-lg sm:text-2xl font-bold">
                {lead.avatarUrl ? (
                  <img
                    src={lead.avatarUrl}
                    alt={lead.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                  />
                ) : (
                  getInitials(lead.name)
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h3 className={`text-lg sm:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {lead.name}
              </h3>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
            
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3 sm:mb-4`}>
              {lead.designation} at {lead.company}
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {lead.campaignName}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>

          {/* Additional Profile Info */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className={`w-full flex items-center justify-between p-2 sm:p-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <span className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Additional Profile Info
              </span>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${showAdditionalInfo ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAdditionalInfo && (
              <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-semibold">JL</span>
                  </div>
                  <div>
                    <p className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Jivesh Lakhani
                    </p>
                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lead.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <h4 className={`text-sm sm:text-base font-medium mb-3 sm:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Activity Timeline
            </h4>
            
            <div className="space-y-3 sm:space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex flex-col items-center">
                    {getActivityIcon(activity.type, activity.status)}
                    {index < activities.length - 1 && (
                      <div className={`w-0.5 h-6 sm:h-8 mt-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
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
            <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                No reply from lead
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 sm:mt-6 space-y-2">
            <button className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors`}>
              Send Message
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className={`py-2 px-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} text-sm font-medium rounded-lg transition-colors`}>
                Schedule Call
              </button>
              <button className={`py-2 px-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} text-sm font-medium rounded-lg transition-colors`}>
                Add Note
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

