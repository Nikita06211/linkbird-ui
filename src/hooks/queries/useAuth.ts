import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, User } from '@/lib/api';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    select: (data) => data.user,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.user(), { user: data.user });
    },
  });
}
