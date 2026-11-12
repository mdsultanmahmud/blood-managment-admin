import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColDef } from 'ag-grid-community';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { bloodApi, type BloodBank } from '@/api/modules/blood';
import { ActionsCell } from '@/components/grid/cells';
import { DataGrid } from '@/components/grid/DataGrid';
import { GridSearch } from '@/components/grid/GridControls';
import { useGridParams } from '@/components/grid/useGridParams';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MenuItemDef } from '@/components/ui/Menu';
import { PageLayout } from '@/components/ui/PageLayout';
import { EmptyState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { useModal } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { permissionKey } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryClient';
import { BANKS_MENU } from '../blood/labels';
import { BankForm } from './BankForm';

const FILTERS = [] as const;
const Cell = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-full min-w-0 items-center">{children}</span>
);

/** Blood banks and hospitals the site lists for visitors. */
export default function BanksPage() {
  const { t } = useTranslation();
  const { can } = useAuth();
  const { openModal, confirm } = useModal();
  const queryClient = useQueryClient();
  const grid = useGridParams({ defaultSort: 'name', filterKeys: FILTERS });
  const { params } = grid;
  const query = useQuery({
    queryKey: [...queryKeys.banks, 'list', params],
    queryFn: () =>
      bloodApi.banks({
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        ...(params.q ? { q: params.q } : {}),
      }),
    placeholderData: keepPreviousData,
  });
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.banks }),
    [queryClient],
  );

  const canCreate = can(permissionKey(BANKS_MENU, 'create'));
  const canUpdate = can(permissionKey(BANKS_MENU, 'update'));
  const canDelete = can(permissionKey(BANKS_MENU, 'delete'));

  const openForm = useCallback(
    async (bank?: BloodBank) => {
      const saved = await openModal<BloodBank>({
        title: bank ? t('banks.form.editTitle', { name: bank.name }) : t('banks.add'),
        size: 'lg',
        content: <BankForm bank={bank} />,
      });
      if (saved) await refresh();
    },
    [openModal, refresh, t],
  );

  const remove = useMutation({
    mutationFn: (b: BloodBank) => bloodApi.removeBank(b.id),
    onSuccess: async (_v, b) => {
      notify.success(t('banks.deleted', { name: b.name }));
      await refresh();
    },
    onError: (err) => notify.error(userMessage(err)),
  });
  const askDelete = useCallback(
    (b: BloodBank) =>
      void confirm({
        title: t('banks.delete.title', { name: b.name }),
        message: t('banks.delete.message'),
        confirmLabel: t('banks.delete.confirm'),
        tone: 'danger',
      }).then((ok) => {
        if (ok) remove.mutate(b);
      }),
    [confirm, remove, t],
  );

  const columns = useMemo<ColDef<BloodBank>[]>(() => {
    const actionsFor = (b: BloodBank): MenuItemDef[] => {
      const items: MenuItemDef[] = [];
      if (canUpdate)
        items.push({
          key: 'edit',
          label: t('banks.action.edit'),
          icon: <LuPencil />,
          onSelect: () => void openForm(b),
        });
      if (canDelete)
        items.push({
          key: 'delete',
          label: t('banks.action.delete'),
          icon: <LuTrash2 />,
          tone: 'danger',
          onSelect: () => askDelete(b),
        });
      return items;
    };
    return [
      {
        colId: 'name',
        headerName: t('blood.field.name'),
        sortable: true,
        flex: 3,
        minWidth: 220,
        lockVisible: true,
        cellRenderer: ({ data }: { data?: BloodBank }) =>
          data ? (
            <span className="flex h-full min-w-0 flex-col justify-center leading-tight">
              <span className="truncate font-medium text-neutral-900">{data.name}</span>
              <span className="truncate text-xs text-neutral-500">{data.address}</span>
            </span>
          ) : null,
      },
      {
        colId: 'district',
        headerName: t('blood.field.district'),
        sortable: true,
        width: 160,
        cellRenderer: ({ data }: { data?: BloodBank }) =>
          data ? <Cell>{data.district}</Cell> : null,
      },
      {
        colId: 'phone',
        headerName: t('blood.field.phone'),
        width: 170,
        cellRenderer: ({ data }: { data?: BloodBank }) =>
          data ? (
            <Cell>
              {data.phone ? (
                <a
                  href={`tel:${data.phone}`}
                  className="truncate text-primary-700 tabular-nums hover:underline"
                >
                  {data.phone}
                </a>
              ) : (
                <span className="text-neutral-400">—</span>
              )}
            </Cell>
          ) : null,
      },
      {
        colId: 'isActive',
        headerName: t('blood.field.status'),
        width: 130,
        cellRenderer: ({ data }: { data?: BloodBank }) =>
          data ? (
            <Cell>
              <Badge tone={data.isActive ? 'success' : 'neutral'} dot>
                {t(data.isActive ? 'banks.active' : 'banks.inactive')}
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
        cellRenderer: ({ data }: { data?: BloodBank }) => {
          const items = data ? actionsFor(data) : [];
          return data && items.length ? (
            <ActionsCell label={t('banks.actionsFor', { name: data.name })} items={items} />
          ) : null;
        },
      },
    ];
  }, [t, canUpdate, canDelete, openForm, askDelete]);

  return (
    <PageLayout
      title={t('banks.title')}
      description={t('banks.description')}
      actions={
        canCreate && (
          <Button variant="primary" icon={<LuPlus />} onClick={() => void openForm()}>
            {t('banks.add')}
          </Button>
        )
      }
      bleed
    >
      <DataGrid
        id="blood-banks"
        label={t('banks.title')}
        columnDefs={columns}
        rows={query.data?.data}
        getRowId={(b) => b.id}
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
          <GridSearch
            value={params.q}
            onChange={grid.setQuery}
            placeholder={t('banks.search')}
            label={t('banks.search')}
          />
        }
        empty={<EmptyState title={t('banks.empty.title')} description={t('banks.empty.message')} />}
        emptyFiltered={<EmptyState title={t('banks.emptyFiltered.title')} />}
      />
    </PageLayout>
  );
}
