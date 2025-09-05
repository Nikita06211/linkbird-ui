"use client";

import { useState, useEffect } from 'react';

interface Campaign {
  id: number;
  name: string;
  status: "active" | "draft" | "paused" | "completed";
  totalLeads: number;
  successfulLeads: number;
  responseRate: number;
  createdAt: string;
  userId: string;
}

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCampaigns(status?: string): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      console.log('Fetching campaigns with params:', params.toString());
      const response = await fetch(`/api/campaigns?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Campaigns API error:', response.status, errorText);
        throw new Error(`Failed to fetch campaigns: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Campaigns data received:', data);
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [status]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}
