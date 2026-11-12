import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { refreshCoordinator, setClientHooks } from '@/api/client';
import { authApi } from '@/api/modules/auth';
import { meApi } from '@/api/modules/me';
import { tokenStore } from '@/api/tokenStore';
import { notify } from '@/lib/notify';
import { queryKeys } from '@/lib/queryClient';
import { AuthContext, type AuthState, type AuthStatus } from './authState';

const EMPTY = new Set<string>();

/**
 * Session lifecycle, as in BC: on load a silent refresh (httpOnly co_rt cookie), then /me and
 * /me/navigation. The access token stays in memory. The site query is never cleared here.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStore.get() ? 'authenticated' : 'booting',
  );

  const endSession = useCallback(() => {
    tokenStore.clear();
    queryClient.removeQueries({ queryKey: queryKeys.me });
    setStatus('anonymous');
  }, [queryClient]);

  useEffect(() => {
    if (status !== 'booting') return;
    let cancelled = false;
    refreshCoordinator
      .refresh()
      .then(() => !cancelled && setStatus('authenticated'))
      .catch(() => !cancelled && setStatus('anonymous'));
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    setClientHooks({
      onSessionExpired: () => {
        if (tokenStore.get() === null && status === 'anonymous') return;
        endSession();
        notify.info(t('auth.session.ended'));
      },
    });
  }, [endSession, status, t]);

  const authenticated = status === 'authenticated';
  const me = useQuery({ queryKey: queryKeys.me, queryFn: meApi.get, enabled: authenticated });
  const nav = useQuery({
    queryKey: queryKeys.navigation,
    queryFn: meApi.navigation,
    enabled: authenticated,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      tokenStore.set(result.accessToken);
      queryClient.removeQueries({ queryKey: queryKeys.me });
      setStatus('authenticated');
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ending the local session matters more than the server call succeeding.
    }
    endSession();
  }, [endSession]);

  const permissions = useMemo(() => (me.data ? new Set(me.data.permissions) : EMPTY), [me.data]);
  const can = useCallback((permission: string) => permissions.has(permission), [permissions]);

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      status,
      isAuthenticated: authenticated && Boolean(me.data),
      me: me.data ?? null,
      permissions,
      navigation: nav.data?.items ?? [],
      routes: nav.data?.routes ?? [],
      isAdmin: me.data?.isAdmin ?? false,
      loadingProfile: authenticated && (me.isPending || nav.isPending),
      profileError: me.error ?? nav.error,
      login,
      logout,
      can,
      refreshProfile,
    }),
    [
      status,
      authenticated,
      me.data,
      me.isPending,
      me.error,
      nav.data,
      nav.isPending,
      nav.error,
      permissions,
      login,
      logout,
      can,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
