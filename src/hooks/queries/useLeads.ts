import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, Lead } from '@/lib/api';

// Query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

// Get all leads
export function useLeads(status?: string, limit?: number) {
  return useQuery({
    queryKey: leadKeys.list({ status, limit }),
    queryFn: () => leadsApi.getAll(status, limit),
    select: (data) => data.leads,
  });
}

// Get lead by ID
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.getById(id),
    select: (data) => data.lead,
    enabled: !!id,
  });
}

// Create lead mutation
export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}

// Update lead mutation
export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific lead in cache
      queryClient.setQueryData(
        leadKeys.detail(variables.id),
        { lead: data.lead }
      );
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}

// Delete lead mutation
export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: leadsApi.delete,
    onSuccess: () => {
      // Invalidate and refetch leads
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}
