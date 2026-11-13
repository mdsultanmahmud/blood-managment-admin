import type {
  ColDef,
  ColumnState,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { storage } from '@/lib/storage';
import { agGridTheme } from '@/themes/engine/agGridTheme';
import { Button } from '../ui/Button';
import { ErrorState } from '../ui/States';
import { ColumnsMenu } from './ColumnsMenu';
import { PAGE_SIZES } from './useGridParams';

export interface ServerPaging {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface DataGridProps<T> {
  /** Stable id: column widths and visibility persist per grid under this key. */
  id: string;
  label: string;
  columnDefs: ColDef<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  loading?: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry?: () => void;
  /** Server pagination; omit for small client-side lists. */
  paging?: ServerPaging;
  /** Backend sort string (`field` / `-field`); colId must equal the backend sort field. */
  sort?: string;
  onSortChange?: (sort: string | null) => void;
  toolbar?: ReactNode;
  /** Shown when there are no rows at all (no filters). */
  empty: ReactNode;
  /** Shown when filters exclude every row. */
  emptyFiltered?: ReactNode;
  filtered?: boolean;
  onRowClicked?: (row: T) => void;
  /** Fixed height for client-side tables; server grids size to their page. */
  autoHeight?: boolean;
  /** 'page' aligns with PageLayout gutters (full-bleed lists); 'card' for grids inside a box. */
  inset?: 'page' | 'card';
  /** Offer the show/hide columns menu (off for small fixed tables). */
  columnsMenu?: boolean;
}

interface StoredColumn {
  colId: string;
  width?: number | null | undefined;
  hide?: boolean | null | undefined;
}

const STORAGE_PREFIX = 'bm.grid.';

function parseSort(sort: string | undefined): { colId: string; sort: 'asc' | 'desc' } | null {
  if (!sort) return null;
  return sort.startsWith('-')
    ? { colId: sort.slice(1), sort: 'desc' }
    : { colId: sort, sort: 'asc' };
}

/**
 * The one list component. Wraps AG Grid Community with server-driven paging and sorting, the
 * app theme, persisted column layout, and loading / empty / error states.
 */
export function DataGrid<T>({
  id,
  label,
  columnDefs,
  rows,
  getRowId,
  loading = false,
  error,
  errorMessage,
  onRetry,
  paging,
  sort,
  onSortChange,
  toolbar,
  empty,
  emptyFiltered,
  filtered = false,
  onRowClicked,
  autoHeight = true,
  inset = 'page',
  columnsMenu = true,
}: DataGridProps<T>) {
  const { t } = useTranslation();
  const gutter = inset === 'page' ? 'px-6 lg:px-8' : 'px-4';
  const apiRef = useRef<GridApi<T> | null>(null);
  const storageKey = STORAGE_PREFIX + id;
  // Stored layout wins; otherwise the column definitions' own `hide` defaults apply.
  const [hidden, setHidden] = useState<Set<string>>(() => {
    const stored = storage.get<StoredColumn[] | null>(storageKey, null);
    if (stored) return new Set(stored.filter((c) => c.hide).map((c) => c.colId));
    return new Set(columnDefs.filter((c) => c.hide && c.colId).map((c) => c.colId ?? ''));
  });

  // Server data is already sorted: neutralize client-side sorting but keep the header UI.
  const cols = useMemo<ColDef<T>[]>(
    () =>
      columnDefs.map((c) => ({
        ...c,
        comparator: () => 0,
        hide: c.colId ? hidden.has(c.colId) : c.hide,
      })),
    [columnDefs, hidden],
  );

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({ sortable: false, resizable: true, suppressMovable: true, minWidth: 80 }),
    [],
  );

  const persist = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const state: StoredColumn[] = api
      .getColumnState()
      .map((c: ColumnState) => ({ colId: c.colId, width: c.width, hide: c.hide }));
    storage.set(storageKey, state);
  }, [storageKey]);

  const onGridReady = useCallback(
    (e: GridReadyEvent<T>) => {
      apiRef.current = e.api;
      const stored = storage.get<StoredColumn[]>(storageKey, []);
      const s = parseSort(sort);
      e.api.applyColumnState({
        state: stored.map((c) => ({ colId: c.colId, ...(c.width ? { width: c.width } : {}) })),
        defaultState: { sort: null },
      });
      if (s) e.api.applyColumnState({ state: [s] });
    },
    // Sort is re-applied by the effect below; this only runs once per grid instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKey],
  );

  // Keep the header sort indicator in sync with the URL.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const s = parseSort(sort);
    api.applyColumnState({ state: s ? [s] : [], defaultState: { sort: null } });
  }, [sort]);

  const onSortChanged = useCallback(
    (e: SortChangedEvent<T>) => {
      if (!onSortChange || e.source !== 'uiColumnSorted') return;
      const sorted = e.api.getColumnState().find((c) => c.sort);
      onSortChange(sorted ? `${sorted.sort === 'desc' ? '-' : ''}${sorted.colId}` : null);
    },
    [onSortChange],
  );

  const toggleColumn = (colId: string, visible: boolean) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(colId);
      else next.add(colId);
      return next;
    });
    queueMicrotask(persist);
  };

  const hideable = columnDefs
    .filter((c) => c.colId && c.lockVisible !== true)
    .map((c) => ({ colId: c.colId ?? '', label: c.headerName ?? c.colId ?? '' }));

  const isEmpty = !loading && !error && rows !== undefined && rows.length === 0;
  const total = paging?.total ?? rows?.length ?? 0;

  const showColumnsMenu = columnsMenu && hideable.length > 0;

  return (
    <div className="flex flex-col">
      {/* Small fixed tables have neither, so no empty band above the header. */}
      {(toolbar || showColumnsMenu) && (
        <div
          data-grid-toolbar
          className={`flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-surface py-3 ${gutter}`}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}</div>
          {showColumnsMenu && (
            <ColumnsMenu
              columns={hideable}
              hidden={hidden}
              onToggle={toggleColumn}
              onReset={() => {
                setHidden(
                  new Set(columnDefs.filter((c) => c.hide && c.colId).map((c) => c.colId ?? '')),
                );
                storage.remove(storageKey);
                apiRef.current?.resetColumnState();
              }}
            />
          )}
        </div>
      )}

      {error ? (
        <div className="bg-surface">
          <ErrorState message={errorMessage} {...(onRetry ? { onRetry } : {})} />
        </div>
      ) : isEmpty ? (
        <div className="bg-surface">{filtered && emptyFiltered ? emptyFiltered : empty}</div>
      ) : (
        <div
          role="region"
          aria-label={label}
          aria-busy={loading}
          className="bg-surface"
          style={autoHeight ? undefined : { height: 480 }}
        >
          <AgGridReact<T>
            theme={agGridTheme}
            rowData={rows ?? []}
            columnDefs={cols}
            defaultColDef={defaultColDef}
            getRowId={(p) => getRowId(p.data)}
            loading={loading && rows === undefined}
            domLayout={autoHeight ? 'autoHeight' : 'normal'}
            onGridReady={onGridReady}
            onSortChanged={onSortChanged}
            onColumnResized={(e) => e.finished && persist()}
            onRowClicked={(e: RowClickedEvent<T>) => {
              const target = e.event?.target as HTMLElement | undefined;
              if (target?.closest('[data-row-action]')) return;
              if (e.data && onRowClicked) onRowClicked(e.data);
            }}
            rowClass={onRowClicked ? 'cursor-pointer' : undefined}
            suppressCellFocus={false}
            animateRows={false}
            overlayLoadingTemplate={`<span class="text-sm">${t('common.loading')}</span>`}
          />
        </div>
      )}

      {paging && !error && total > 0 && <Pager paging={paging} loading={loading} gutter={gutter} />}
    </div>
  );
}

function Pager({
  paging,
  loading,
  gutter,
}: {
  paging: ServerPaging;
  loading: boolean;
  gutter: string;
}) {
  const { t } = useTranslation();
  const { page, pageSize, total, onPageChange, onPageSizeChange } = paging;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-surface py-2.5 text-[13px] text-neutral-600 ${gutter}`}
    >
      <p aria-live="polite" className="tabular-nums">
        {t('common.grid.range', { from, to, total })}
      </p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span>{t('common.grid.rowsPerPage')}</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-sm border border-neutral-300 bg-surface px-1.5 text-[13px] text-neutral-800"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <span className="tabular-nums">{t('common.grid.pageOf', { page, pages })}</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            iconOnly
            aria-label={t('common.grid.previous')}
            icon={<LuChevronLeft />}
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          />
          <Button
            size="sm"
            iconOnly
            aria-label={t('common.grid.next')}
            icon={<LuChevronRight />}
            disabled={page >= pages || loading}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      </div>
    </div>
  );
}
