import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColDef } from 'ag-grid-community';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuPencil,
  LuPlus,
  LuSend,
  LuTrash2,
} from 'react-icons/lu';
import {
  bloodApi,
  REQUEST_STATUSES,
  type BloodRequest,
  type RequestStatus,
} from '@/api/modules/blood';
import { ActionsCell } from '@/components/grid/cells';
import { DataGrid } from '@/components/grid/DataGrid';
import { GridFilterMulti, GridSearch } from '@/components/grid/GridControls';
import { useGridParams } from '@/components/grid/useGridParams';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MenuItemDef } from '@/components/ui/Menu';
import { PageLayout } from '@/components/ui/PageLayout';
import { EmptyState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { useModal } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { notify } from '@/lib/notify';
import { permissionKey } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryClient';
import {
  GROUP_KEY,
  REQUESTS_MENU,
  REQUEST_STATUS_KEY,
  REQUEST_STATUS_TONE,
  URGENCY_KEY,
  URGENCY_TONE,
} from '../blood/labels';
import { RequestForm } from './RequestForm';

const FILTERS = ['status'] as const;
const split = (v: string | undefined) => (v ? v.split(',').filter(Boolean) : []);
const Cell = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-full min-w-0 items-center">{children}</span>
);

/** Blood requests from the site and from staff: verify them, mark them fulfilled, or reject. */
export default function RequestsPage() {
  const { t } = useTranslation();
  const { can } = useAuth();
  const { openModal, confirm } = useModal();
  const queryClient = useQueryClient();
  const grid = useGridParams({ defaultSort: '-createdAt', filterKeys: FILTERS });
  const { params } = grid;
  const query = useQuery({
    queryKey: [...queryKeys.requests, 'list', params],
    queryFn: () =>
      bloodApi.requests({
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        ...(params.q ? { q: params.q } : {}),
        ...params.filters,
      }),
    placeholderData: keepPreviousData,
  });
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.requests }),
    [queryClient],
  );

  const canCreate = can(permissionKey(REQUESTS_MENU, 'create'));
  const canUpdate = can(permissionKey(REQUESTS_MENU, 'update'));
  const canDelete = can(permissionKey(REQUESTS_MENU, 'delete'));

  const openForm = useCallback(
    async (request?: BloodRequest) => {
      const saved = await openModal<BloodRequest>({
        title: request
          ? t('requests.form.editTitle', { name: request.patientName })
          : t('requests.add'),
        size: 'lg',
        content: <RequestForm request={request} />,
      });
      if (saved) await refresh();
    },
    [openModal, refresh, t],
  );

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      bloodApi.changeRequestStatus(id, status),
    onSuccess: async () => {
      notify.success(t('requests.statusChanged'));
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      await refresh();
    },
    onError: (err) => notify.error(userMessage(err)),
  });
  const reject = useCallback(
    (r: BloodRequest) =>
      void confirm({
        title: t('requests.reject.title', { name: r.patientName }),
        message: t('requests.reject.message'),
        confirmLabel: t('requests.reject.confirm'),
        tone: 'danger',
      }).then((ok) => {
        if (ok) changeStatus.mutate({ id: r.id, status: 'REJECTED' });
      }),
    [confirm, changeStatus, t],
  );

  const remove = useMutation({
    mutationFn: (r: BloodRequest) => bloodApi.removeRequest(r.id),
    onSuccess: async () => {
      notify.success(t('requests.deleted'));
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      await refresh();
    },
    onError: (err) => notify.error(userMessage(err)),
  });
  const askDelete = useCallback(
    (r: BloodRequest) =>
      void confirm({
        title: t('requests.delete.title', { name: r.patientName }),
        message: t('requests.delete.message'),
        confirmLabel: t('requests.delete.confirm'),
        tone: 'danger',
      }).then((ok) => {
        if (ok) remove.mutate(r);
      }),
    [confirm, remove, t],
  );

  const columns = useMemo<ColDef<BloodRequest>[]>(() => {
    const actionsFor = (r: BloodRequest): MenuItemDef[] => {
      const items: MenuItemDef[] = [];
      if (canUpdate && r.status === 'PENDING')
        items.push({
          key: 'verify',
          label: t('requests.action.verify'),
          icon: <LuCircleCheck />,
          onSelect: () => changeStatus.mutate({ id: r.id, status: 'VERIFIED' }),
        });
      if (canUpdate && r.status === 'VERIFIED')
        items.push({
          key: 'fulfil',
          label: t('requests.action.fulfil'),
          icon: <LuSend />,
          onSelect: () => changeStatus.mutate({ id: r.id, status: 'FULFILLED' }),
        });
      if (canUpdate && (r.status === 'PENDING' || r.status === 'VERIFIED'))
        items.push({
          key: 'reject',
          label: t('requests.action.reject'),
          icon: <LuCircleX />,
          tone: 'danger',
          onSelect: () => reject(r),
        });
      if (canUpdate)
        items.push({
          key: 'edit',
          label: t('requests.action.edit'),
          icon: <LuPencil />,
          onSelect: () => void openForm(r),
        });
      if (canDelete)
        items.push({
          key: 'delete',
          label: t('requests.action.delete'),
          icon: <LuTrash2 />,
          tone: 'danger',
          onSelect: () => askDelete(r),
        });
      return items;
    };
    return [
      {
        colId: 'bloodGroup',
        headerName: t('blood.field.bloodGroup'),
        width: 100,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? (
            <Cell>
              <Badge tone="primary">{t(GROUP_KEY[data.bloodGroup])}</Badge>
            </Cell>
          ) : null,
      },
      {
        colId: 'patientName',
        headerName: t('requests.col.patient'),
        flex: 3,
        minWidth: 220,
        lockVisible: true,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? (
            <span className="flex h-full min-w-0 flex-col justify-center leading-tight">
              <span className="truncate font-medium text-neutral-900">{data.patientName}</span>
              <span className="truncate text-xs text-neutral-500">
                {data.hospital}, {data.district}
              </span>
            </span>
          ) : null,
      },
      {
        colId: 'units',
        headerName: t('blood.field.units'),
        width: 90,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? <Cell>{data.units}</Cell> : null,
      },
      {
        colId: 'urgency',
        headerName: t('blood.field.urgency'),
        sortable: true,
        width: 130,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? (
            <Cell>
              <Badge tone={URGENCY_TONE[data.urgency]}>{t(URGENCY_KEY[data.urgency])}</Badge>
            </Cell>
          ) : null,
      },
      {
        colId: 'neededBy',
        headerName: t('blood.field.neededBy'),
        sortable: true,
        width: 190,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? (
            <Cell>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <LuClock className="text-neutral-400" aria-hidden />
                {formatDateTime(data.neededBy)}
              </span>
            </Cell>
          ) : null,
      },
      {
        colId: 'contact',
        headerName: t('requests.col.contact'),
        flex: 2,
        minWidth: 190,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? (
            <span className="flex h-full min-w-0 flex-col justify-center leading-tight">
              <span className="truncate">{data.contactName}</span>
              <a
                href={`tel:${data.contactPhone}`}
                className="truncate text-xs text-primary-700 tabular-nums hover:underline"
              >
                {data.contactPhone}
              </a>
            </span>
          ) : null,
      },
      {
        colId: 'status',
        headerName: t('blood.field.status'),
        width: 170,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? (
            <Cell>
              <Badge tone={REQUEST_STATUS_TONE[data.status]} dot>
                {t(REQUEST_STATUS_KEY[data.status])}
              </Badge>
            </Cell>
          ) : null,
      },
      {
        colId: 'createdAt',
        headerName: t('blood.field.created'),
        sortable: true,
        hide: true,
        width: 190,
        cellRenderer: ({ data }: { data?: BloodRequest }) =>
          data ? <Cell>{formatDateTime(data.createdAt)}</Cell> : null,
      },
      {
        colId: 'actions',
        headerName: '',
        width: 64,
        lockVisible: true,
        resizable: false,
        cellRenderer: ({ data }: { data?: BloodRequest }) => {
          const items = data ? actionsFor(data) : [];
          return data && items.length ? (
            <ActionsCell
              label={t('requests.actionsFor', { name: data.patientName })}
              items={items}
            />
          ) : null;
        },
      },
    ];
  }, [t, canUpdate, canDelete, changeStatus, reject, openForm, askDelete]);

  const statusOptions = REQUEST_STATUSES.map((s) => ({
    value: s,
    label: t(REQUEST_STATUS_KEY[s]),
  }));

  return (
    <PageLayout
      title={t('requests.title')}
      description={t('requests.description')}
      actions={
        canCreate && (
          <Button variant="primary" icon={<LuPlus />} onClick={() => void openForm()}>
            {t('requests.add')}
          </Button>
        )
      }
      bleed
    >
      <DataGrid
        id="blood-requests"
        label={t('requests.title')}
        columnDefs={columns}
        rows={query.data?.data}
        getRowId={(r) => r.id}
        loading={query.isPending || query.isPlaceholderData}
        error={query.error}
        onRetry={() => void query.refetch()}
        paging={
          query.data && {
            page: query.data.meta.page,
            pageSize: query.data.meta.pageSize,
            total: query.data.meta.total,
            onPageChange: grid.setPage,
            onPageSizeChange: grid.setPageSize,
          }
        }
        sort={params.sort}
        onSortChange={grid.setSort}
        filtered={grid.hasFilters}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <GridSearch
              value={params.q}
              onChange={grid.setQuery}
              placeholder={t('requests.search')}
              label={t('requests.search')}
            />
            <GridFilterMulti
              label={t('blood.field.status')}
              value={split(params.filters.status)}
              onChange={(v) => grid.setFilter('status', v.length ? v.join(',') : null)}
              options={statusOptions}
            />
          </div>
        }
        empty={
          <EmptyState title={t('requests.empty.title')} description={t('requests.empty.message')} />
        }
        emptyFiltered={<EmptyState title={t('requests.emptyFiltered.title')} />}
      />
    </PageLayout>
  );
}
