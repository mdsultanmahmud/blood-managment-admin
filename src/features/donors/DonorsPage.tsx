import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColDef } from 'ag-grid-community';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LuCircleCheck, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { bloodApi, DONOR_STATUSES, type Donor } from '@/api/modules/blood';
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
import { formatDay } from '@/lib/format';
import { notify } from '@/lib/notify';
import { permissionKey } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryClient';
import { DONORS_MENU, DONOR_STATUS_KEY, DONOR_STATUS_TONE, GROUP_KEY } from '../blood/labels';
import { DonorForm } from './DonorForm';

const FILTERS = ['status'] as const;
const split = (v: string | undefined) => (v ? v.split(',').filter(Boolean) : []);
const Cell = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-full min-w-0 items-center">{children}</span>
);

/** Donors registered by staff and by visitors of the site (those start pending). */
export default function DonorsPage() {
  const { t } = useTranslation();
  const { can } = useAuth();
  const { openModal, confirm } = useModal();
  const queryClient = useQueryClient();
  const grid = useGridParams({ defaultSort: '-createdAt', filterKeys: FILTERS });
  const { params } = grid;
  const query = useQuery({
    queryKey: [...queryKeys.donors, 'list', params],
    queryFn: () =>
      bloodApi.donors({
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        ...(params.q ? { name: params.q } : {}),
        ...params.filters,
      }),
    placeholderData: keepPreviousData,
  });
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.donors });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  }, [queryClient]);

  const canCreate = can(permissionKey(DONORS_MENU, 'create'));
  const canUpdate = can(permissionKey(DONORS_MENU, 'update'));
  const canDelete = can(permissionKey(DONORS_MENU, 'delete'));

  const openForm = useCallback(
    async (donor?: Donor) => {
      const saved = await openModal<Donor>({
        title: donor ? t('donors.form.editTitle', { name: donor.fullName }) : t('donors.add'),
        size: 'lg',
        content: <DonorForm donor={donor} />,
      });
      if (saved) await refresh();
    },
    [openModal, refresh, t],
  );

  const verify = useMutation({
    mutationFn: (d: Donor) => bloodApi.updateDonor(d.id, { status: 'VERIFIED' }),
    onSuccess: async (d) => {
      notify.success(t('donors.verified', { name: d.fullName }));
      await refresh();
    },
    onError: (err) => notify.error(userMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (d: Donor) => bloodApi.removeDonor(d.id),
    onSuccess: async (_v, d) => {
      notify.success(t('donors.deleted', { name: d.fullName }));
      await refresh();
    },
    onError: (err) => notify.error(userMessage(err)),
  });
  const askDelete = useCallback(
    (d: Donor) =>
      void confirm({
        title: t('donors.delete.title', { name: d.fullName }),
        message: t('donors.delete.message'),
        confirmLabel: t('donors.delete.confirm'),
        tone: 'danger',
      }).then((ok) => {
        if (ok) remove.mutate(d);
      }),
    [confirm, remove, t],
  );

  const columns = useMemo<ColDef<Donor>[]>(() => {
    const actionsFor = (d: Donor): MenuItemDef[] => {
      const items: MenuItemDef[] = [];
      if (canUpdate && d.status === 'PENDING')
        items.push({
          key: 'verify',
          label: t('donors.action.verify'),
          icon: <LuCircleCheck />,
          onSelect: () => verify.mutate(d),
        });
      if (canUpdate)
        items.push({
          key: 'edit',
          label: t('donors.action.edit'),
          icon: <LuPencil />,
          onSelect: () => void openForm(d),
        });
      if (canDelete)
        items.push({
          key: 'delete',
          label: t('donors.action.delete'),
          icon: <LuTrash2 />,
          tone: 'danger',
          onSelect: () => askDelete(d),
        });
      return items;
    };
    return [
      {
        colId: 'bloodGroup',
        headerName: t('blood.field.bloodGroup'),
        width: 100,
        cellRenderer: ({ data }: { data?: Donor }) =>
          data ? (
            <Cell>
              <Badge tone="primary">{t(GROUP_KEY[data.bloodGroup])}</Badge>
            </Cell>
          ) : null,
      },
      {
        colId: 'fullName',
        headerName: t('blood.field.fullName'),
        sortable: true,
        flex: 3,
        minWidth: 200,
        lockVisible: true,
        cellRenderer: ({ data }: { data?: Donor }) =>
          data ? (
            <span className="flex h-full min-w-0 flex-col justify-center leading-tight">
              <span className="truncate font-medium text-neutral-900">{data.fullName}</span>
              <span className="truncate text-xs text-neutral-500">{data.district}</span>
            </span>
          ) : null,
      },
      {
        colId: 'phone',
        headerName: t('blood.field.phone'),
        flex: 2,
        minWidth: 160,
        cellRenderer: ({ data }: { data?: Donor }) =>
          data ? (
            <Cell>
              <a
                href={`tel:${data.phone}`}
                className="truncate text-primary-700 tabular-nums hover:underline"
              >
                {data.phone}
              </a>
            </Cell>
          ) : null,
      },
      {
        colId: 'lastDonatedOn',
        headerName: t('blood.field.lastDonatedOn'),
        sortable: true,
        width: 160,
        cellRenderer: ({ data }: { data?: Donor }) =>
          data ? (
            <Cell>
              {data.lastDonatedOn ? (
                <time dateTime={data.lastDonatedOn} className="tabular-nums">
                  {formatDay(data.lastDonatedOn)}
                </time>
              ) : (
                <span className="text-neutral-400">{t('donors.never')}</span>
              )}
            </Cell>
          ) : null,
      },
      {
        colId: 'isAvailable',
        headerName: t('blood.field.isAvailable'),
        width: 130,
        cellRenderer: ({ data }: { data?: Donor }) =>
          data ? (
            <Cell>
              <Badge tone={data.isAvailable ? 'success' : 'neutral'} dot>
                {t(data.isAvailable ? 'donors.available' : 'donors.unavailable')}
              </Badge>
            </Cell>
          ) : null,
      },
      {
        colId: 'status',
        headerName: t('blood.field.status'),
        width: 150,
        cellRenderer: ({ data }: { data?: Donor }) =>
          data ? (
            <Cell>
              <Badge tone={DONOR_STATUS_TONE[data.status]} dot>
                {t(DONOR_STATUS_KEY[data.status])}
              </Badge>
            </Cell>
          ) : null,
      },
      {
        colId: 'actions',
        headerName: '',
        width: 64,
        lockVisible: true,
        resizable: false,
        cellRenderer: ({ data }: { data?: Donor }) => {
          const items = data ? actionsFor(data) : [];
          return data && items.length ? (
            <ActionsCell label={t('donors.actionsFor', { name: data.fullName })} items={items} />
          ) : null;
        },
      },
    ];
  }, [t, canUpdate, canDelete, verify, openForm, askDelete]);

  return (
    <PageLayout
      title={t('donors.title')}
      description={t('donors.description')}
      actions={
        canCreate && (
          <Button variant="primary" icon={<LuPlus />} onClick={() => void openForm()}>
            {t('donors.add')}
          </Button>
        )
      }
      bleed
    >
      <DataGrid
        id="blood-donors"
        label={t('donors.title')}
        columnDefs={columns}
        rows={query.data?.data}
        getRowId={(d) => d.id}
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
              placeholder={t('donors.search')}
              label={t('donors.search')}
            />
            <GridFilterMulti
              label={t('blood.field.status')}
              value={split(params.filters.status)}
              onChange={(v) => grid.setFilter('status', v.length ? v.join(',') : null)}
              options={DONOR_STATUSES.map((s) => ({ value: s, label: t(DONOR_STATUS_KEY[s]) }))}
            />
          </div>
        }
        empty={
          <EmptyState title={t('donors.empty.title')} description={t('donors.empty.message')} />
        }
        emptyFiltered={<EmptyState title={t('donors.emptyFiltered.title')} />}
      />
    </PageLayout>
  );
}
