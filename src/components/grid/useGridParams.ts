import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export const PAGE_SIZES = [10, 20, 50, 100] as const;

export interface GridParams<F extends string> {
  page: number;
  pageSize: number;
  /** Backend sort string: `field` or `-field`. */
  sort: string;
  q: string;
  filters: Partial<Record<F, string>>;
}

/**
 * Server-driven grid state kept in the URL (shareable, survives reload, back button works).
 * Changing search, filters, sort or page size resets to page 1.
 */
export function useGridParams<F extends string>(options: {
  defaultSort: string;
  defaultPageSize?: number;
  filterKeys: readonly F[];
}) {
  const [search, setSearch] = useSearchParams();
  const { defaultSort, defaultPageSize = 20, filterKeys } = options;

  const params = useMemo<GridParams<F>>(() => {
    const pageSize = Number(search.get('pageSize'));
    const filters: Partial<Record<F, string>> = {};
    for (const key of filterKeys) {
      const v = search.get(key);
      if (v) filters[key] = v;
    }
    return {
      page: Math.max(1, Number(search.get('page')) || 1),
      pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : defaultPageSize,
      sort: search.get('sort') ?? defaultSort,
      q: search.get('q') ?? '',
      filters,
    };
  }, [search, filterKeys, defaultSort, defaultPageSize]);

  const update = useCallback(
    (changes: Record<string, string | number | null | undefined>, resetPage = true) => {
      setSearch(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(changes)) {
            if (v === null || v === undefined || v === '') next.delete(k);
            else next.set(k, String(v));
          }
          if (resetPage && !('page' in changes)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearch],
  );

  return {
    params,
    setPage: (page: number) => update({ page: page === 1 ? null : page }, false),
    setPageSize: (pageSize: number) => update({ pageSize }),
    setSort: (sort: string | null) => update({ sort: sort === defaultSort ? null : sort }),
    setQuery: (q: string) => update({ q }),
    setFilter: (key: F, value: string | null) => update({ [key]: value }),
    clearFilters: () =>
      update(Object.fromEntries([['q', null], ...filterKeys.map((k) => [k, null] as const)])),
    hasFilters: params.q !== '' || Object.keys(params.filters).length > 0,
  };
}
