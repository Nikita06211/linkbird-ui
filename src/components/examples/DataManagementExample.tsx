'use client';

import { useState } from 'react';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/queries/useCampaigns';
import { useUIStore } from '@/stores/uiStore';
import { useThemeStore } from '@/stores/themeStore';

export default function DataManagementExample() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  
  // Zustand stores
  const { addNotification } = useUIStore();
  const { theme } = useThemeStore();
  
  // TanStack Query hooks
  const { data: campaigns = [], isLoading, error, refetch } = useCampaigns(selectedStatus === 'all' ? undefined : selectedStatus);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return;
    
    try {
      await createCampaign.mutateAsync({
        name: newCampaignName,
        status: 'draft',
        totalLeads: 0,
        successfulLeads: 0,
        responseRate: 0,
        userId: 'current-user-id', // This would come from auth store
      });
      
      addNotification({
        type: 'success',
        message: 'Campaign created successfully!',
        duration: 3000,
      });
      
      setNewCampaignName('');
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to create campaign',
        duration: 5000,
      });
    }
  };

  const handleUpdateCampaign = async (id: string, status: string) => {
    try {
      await updateCampaign.mutateAsync({
        id,
        data: { status: status as any },
      });
      
      addNotification({
        type: 'success',
        message: 'Campaign updated successfully!',
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update campaign',
        duration: 5000,
      });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteCampaign.mutateAsync(id);
      
      addNotification({
        type: 'success',
        message: 'Campaign deleted successfully!',
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to delete campaign',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <div className="text-center">
          <p className={`text-red-500 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
            Error loading campaigns: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
      <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Campaign Management Example
      </h2>
      
      {/* Create new campaign */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newCampaignName}
          onChange={(e) => setNewCampaignName(e.target.value)}
          placeholder="New campaign name"
          className={`flex-1 px-3 py-2 border rounded ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <button
          onClick={handleCreateCampaign}
          disabled={createCampaign.isPending || !newCampaignName.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {createCampaign.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`px-3 py-2 border rounded ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Campaigns</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Campaigns list */}
      <div className="space-y-2">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className={`p-4 border rounded ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {campaign.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {campaign.totalLeads} leads • {campaign.responseRate}% response
                </p>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={campaign.status}
                  onChange={(e) => handleUpdateCampaign(campaign.id, e.target.value)}
                  className={`px-2 py-1 text-xs border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
                
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  disabled={deleteCampaign.isPending}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          No campaigns found
        </p>
      )}
    </div>
  );
}
