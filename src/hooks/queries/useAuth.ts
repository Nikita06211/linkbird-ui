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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
