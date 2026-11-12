import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toApiError } from '@/api/errors';

export function createQueryClient(): QueryClient {
  // A 403 means the user's access changed under an open screen (a role was edited): refetch
  // /me and /me/navigation so menus, routes and buttons catch up (ADR 0023).
  const onError = (error: unknown) => {
    if (toApiError(error).status === 403) void client.invalidateQueries({ queryKey: queryKeys.me });
  };
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retry only transient failures; 4xx answers will not change on retry.
        retry: (count, error) => {
          const e = toApiError(error);
          return (e.isNetwork || e.status >= 500) && count < 2;
        },
      },
      mutations: { retry: false },
    },
  });
  return client;
}

/** Query keys in one place so invalidation stays consistent. */
export const queryKeys = {
  site: ['site'] as const,
  me: ['me'] as const,
  navigation: ['me', 'navigation'] as const,
  accessMenus: ['access', 'menus'] as const,
  roles: ['roles'] as const,
  role: (id: string) => ['roles', id] as const,
  staff: ['staff'] as const,
  donors: ['donors'] as const,
  donor: (id: string) => ['donors', id] as const,
  bloodGroups: ['blood-groups'] as const,
  contacts: ['contacts'] as const,
};
