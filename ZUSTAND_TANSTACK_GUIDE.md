# Zustand + TanStack Query Integration Guide

This guide explains how to use Zustand for state management and TanStack Query for data fetching in the LinkBird project.

## 🏗️ Architecture Overview

### **Zustand Stores**
- **Theme Store** (`src/stores/themeStore.ts`) - Light/dark theme management
- **Auth Store** (`src/stores/authStore.ts`) - User authentication state
- **UI Store** (`src/stores/uiStore.ts`) - Sidebar, modals, notifications

### **TanStack Query**
- **API Layer** (`src/lib/api.ts`) - Centralized API functions
- **Query Hooks** (`src/hooks/queries/`) - React Query hooks for data fetching
- **Query Client** (`src/lib/queryClient.ts`) - Query client configuration

## 📦 Zustand Stores

### **Theme Store**
```typescript
import { useThemeStore } from '@/stores/themeStore';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### **Auth Store**
```typescript
import { useAuthStore } from '@/stores/authStore';

function UserProfile() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  
  if (!isAuthenticated) return <LoginForm />;
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### **UI Store**
```typescript
import { useUIStore } from '@/stores/uiStore';

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  
  return (
    <div className={sidebarCollapsed ? 'w-16' : 'w-64'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
}
```

## 🔄 TanStack Query Usage

### **Basic Query**
```typescript
import { useCampaigns } from '@/hooks/queries/useCampaigns';

function CampaignsList() {
  const { data: campaigns, isLoading, error } = useCampaigns();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {campaigns?.map(campaign => (
        <div key={campaign.id}>{campaign.name}</div>
      ))}
    </div>
  );
}
```

### **Filtered Query**
```typescript
function ActiveCampaigns() {
  const { data: campaigns } = useCampaigns('active');
  // Only active campaigns
}
```

### **Mutations**
```typescript
import { useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/queries/useCampaigns';

function CampaignForm() {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  
  const handleCreate = async (data) => {
    try {
      await createCampaign.mutateAsync(data);
      // Success - data is automatically refetched
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleCreate}>
      {/* Form fields */}
    </form>
  );
}
```

## 🎯 Best Practices

### **1. Store Organization**
- Keep stores focused on specific domains
- Use TypeScript interfaces for type safety
- Persist only necessary data

### **2. Query Keys**
- Use consistent query key patterns
- Include filters in query keys for proper caching
- Use query key factories for maintainability

### **3. Error Handling**
```typescript
const { data, error, isError } = useCampaigns();

if (isError) {
  return <ErrorComponent error={error} />;
}
```

### **4. Loading States**
```typescript
const { data, isLoading, isFetching } = useCampaigns();

return (
  <div>
    {isLoading && <div>Initial loading...</div>}
    {isFetching && <div>Refreshing...</div>}
    {/* Content */}
  </div>
);
```

### **5. Optimistic Updates**
```typescript
const updateCampaign = useMutation({
  mutationFn: updateCampaignApi,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: campaignKeys.lists() });
    
    // Snapshot previous value
    const previousCampaigns = queryClient.getQueryData(campaignKeys.lists());
    
    // Optimistically update
    queryClient.setQueryData(campaignKeys.lists(), old => 
      old?.map(campaign => 
        campaign.id === newData.id ? { ...campaign, ...newData } : campaign
      )
    );
    
    return { previousCampaigns };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(campaignKeys.lists(), context?.previousCampaigns);
  },
});
```

## 🔧 Configuration

### **Query Client Setup**
```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### **Provider Setup**
```typescript
// src/app/layout.tsx
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

## 📊 Data Flow

1. **Component mounts** → Calls TanStack Query hook
2. **Query hook** → Calls API function
3. **API function** → Makes HTTP request
4. **Response** → Cached and returned to component
5. **Mutation** → Updates cache and refetches related queries
6. **Zustand store** → Manages UI state and user preferences

## 🚀 Advanced Features

### **Infinite Queries**
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['campaigns'],
  queryFn: ({ pageParam = 0 }) => fetchCampaigns(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### **Background Refetching**
```typescript
const { data } = useCampaigns({
  refetchInterval: 30000, // Refetch every 30 seconds
  refetchIntervalInBackground: true,
});
```

### **Selective Data**
```typescript
const { data: campaignNames } = useCampaigns(undefined, {
  select: (data) => data?.map(campaign => campaign.name),
});
```

## 🎨 Integration with UI

### **Theme Integration**
```typescript
function ThemedComponent() {
  const { theme } = useThemeStore();
  const { data: campaigns } = useCampaigns();
  
  return (
    <div className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
      {campaigns?.map(campaign => (
        <div key={campaign.id}>{campaign.name}</div>
      ))}
    </div>
  );
}
```

### **Notification Integration**
```typescript
function CampaignActions() {
  const { addNotification } = useUIStore();
  const createCampaign = useCreateCampaign();
  
  const handleCreate = async (data) => {
    try {
      await createCampaign.mutateAsync(data);
      addNotification({
        type: 'success',
        message: 'Campaign created successfully!',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to create campaign',
      });
    }
  };
}
```

This architecture provides a robust, scalable foundation for managing both client-side state and server-side data in your LinkBird application.
