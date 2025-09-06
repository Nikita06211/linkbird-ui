import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, Campaign } from '@/lib/api';

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

// Get all campaigns
export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: campaignKeys.list({ status }),
    queryFn: () => campaignsApi.getAll(status),
    select: (data) => data.campaigns,
  });
}

// Get campaign by ID
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsApi.getById(id),
    select: (data) => data.campaign,
    enabled: !!id,
  });
}

// Create campaign mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: () => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Update campaign mutation
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
      campaignsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific campaign in cache
      queryClient.setQueryData(
        campaignKeys.detail(variables.id),
        { campaign: data.campaign }
      );
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Delete campaign mutation
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: campaignsApi.delete,
    onSuccess: () => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
