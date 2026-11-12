import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { createQueryClient, queryKeys } from './queryClient';

describe('query client', () => {
  it('refetches the profile and navigation after a 403, so a stale screen catches up', async () => {
    const client = createQueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    await client
      .query({
        queryKey: ['roles', 'list'],
        queryFn: () => Promise.reject(new ApiError(403, 'FORBIDDEN', 'forbidden')),
      })
      .catch(() => undefined);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me });

    invalidate.mockClear();
    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.reject(new ApiError(403, 'PERMISSION_ESCALATION', 'no')),
      })
      .execute(undefined)
      .catch(() => undefined);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.me });
  });

  it('leaves the profile alone on other errors', async () => {
    const client = createQueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    await client
      .query({
        queryKey: ['roles', 'list'],
        queryFn: () => Promise.reject(new ApiError(409, 'ROLE_IN_USE', 'in use')),
      })
      .catch(() => undefined);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
