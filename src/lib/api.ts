// API utility functions for TanStack Query

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'paused' | 'completed';
  totalLeads: number;
  successfulLeads: number;
  responseRate: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  designation: string;
  company: string;
  status: 'pending' | 'contacted' | 'responded' | 'converted';
  campaignId: string;
  campaignName: string;
  avatarUrl?: string;
  lastContactAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  });

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// Campaigns API
export const campaignsApi = {
  getAll: (status?: string) => 
    apiRequest<{ campaigns: Campaign[] }>(`/api/campaigns${status ? `?status=${status}` : ''}`),
  
  getById: (id: string) => 
    apiRequest<{ campaign: Campaign }>(`/api/campaigns/${id}`),
    
  create: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<{ campaign: Campaign }>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<Campaign>) =>
    apiRequest<{ campaign: Campaign }>(`/api/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/campaigns/${id}`, {
      method: 'DELETE',
    }),
};

// Leads API
export const leadsApi = {
  getAll: (status?: string, limit?: number) => 
    apiRequest<{ leads: Lead[] }>(`/api/leads${status || limit ? `?${new URLSearchParams({
      ...(status && { status }),
      ...(limit && { limit: limit.toString() }),
    })}` : ''}`),
    
  getById: (id: string) => 
    apiRequest<{ lead: Lead }>(`/api/leads/${id}`),
    
  create: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<{ lead: Lead }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<Lead>) =>
    apiRequest<{ lead: Lead }>(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/leads/${id}`, {
      method: 'DELETE',
    }),
};

// Auth API
export const authApi = {
  getCurrentUser: () => 
    apiRequest<{ user: User }>('/api/auth/me'),
    
  updateProfile: (data: Partial<User>) =>
    apiRequest<{ user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
