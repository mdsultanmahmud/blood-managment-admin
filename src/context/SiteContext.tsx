import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, type ReactNode } from 'react';
import { toApiError } from '@/api/errors';
import { siteApi } from '@/api/modules/site';
import { applyLanguage } from '@/i18n/language';
import { apiUrl } from '@/lib/env';
import { setFavicon } from '@/lib/favicon';
import { queryKeys } from '@/lib/queryClient';
import { SiteContext, type SiteState, type SiteStatus } from './siteState';

/**
 * Loads the site behind this admin URL once (GET /site) and applies what it decides: language,
 * tab title and icon. The theme follows `site.themeKey` (see SiteTheme).
 */
export function SiteProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: queryKeys.site, queryFn: siteApi.get, staleTime: Infinity });
  const { data, error, isPending, refetch } = query;

  const status: SiteStatus = data
    ? 'ready'
    : isPending
      ? 'loading'
      : toApiError(error).code === 'SITE_NOT_FOUND'
        ? 'not-found'
        : 'error';

  useEffect(() => {
    if (!data) return;
    void applyLanguage(data.languages, data.defaultLanguage);
    document.title = `${data.company.title} · ${data.app.name}`;
    setFavicon(apiUrl(data.company.logoUrl));
  }, [data]);

  const value = useMemo<SiteState>(
    () => ({ status, site: data ?? null, error, retry: () => void refetch() }),
    [status, data, error, refetch],
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
