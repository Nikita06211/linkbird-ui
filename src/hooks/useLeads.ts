"use client";

import { useState, useEffect } from 'react';

interface Lead {
  id: number;
  name: string;
  designation: string;
  email: string;
  company: string;
  status: "pending" | "contacted" | "responded" | "converted";
  lastContactAt: string;
  avatarUrl?: string;
  campaignId: number;
  campaignName: string;
}

interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLeads(status?: string, limit?: number): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      const response = await fetch(`/api/leads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [status, limit]);

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
  };
}
