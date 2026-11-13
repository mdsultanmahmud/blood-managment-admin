import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LuPencil, LuPlus, LuShieldCheck, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router';
import { rolesApi, type RoleSummary } from '@/api/modules/roles';
import { ActionsCell, DateCell } from '@/components/grid/cells';
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

const MENU = 'role_management';
const NO_FILTERS = [] as const;

/** The company app's roles, laid out like BC's Roles page. */
export function RoleListPage({ basePath }: { basePath: string }) {
  const { t } = useTranslation();
  const { can } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useModal();
  const queryClient = useQueryClient();
  const grid = useGridParams({ defaultSort: 'name', filterKeys: NO_FILTERS });
  const { params } = grid;
  const query = useQuery({
    queryKey: [...queryKeys.roles, 'list', params],
    queryFn: () =>
      rolesApi.list({
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        q: params.q,
      }),
    placeholderData: keepPreviousData,
  });
  const remove = useMutation({
    mutationFn: rolesApi.remove,
    onSuccess: async () => {
      notify.success(t('roles.deleted'));
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
    onError: (err) => notify.error(userMessage(err)),
  });

  const canCreate = can(permissionKey(MENU, 'create'));
  const canUpdate = can(permissionKey(MENU, 'update'));
  const canDelete = can(permissionKey(MENU, 'delete'));
  const open = (id: string) => void navigate(`${basePath}/${id}`);
  const create = () => void navigate(`${basePath}/new`);

  const columns = useMemo<ColDef<RoleSummary>[]>(() => {
    const actionsFor = (role: RoleSummary): MenuItemDef[] => {
      const items: MenuItemDef[] = [
        {
          key: 'open',
          label: !role.isLocked && canUpdate ? t('roles.action.edit') : t('roles.action.view'),
          icon: <LuPencil />,
          onSelect: () => open(role.id),
        },
      ];
      if (!role.isLocked && canDelete) {
        items.push({
          key: 'delete',
          label: t('roles.action.delete'),
          icon: <LuTrash2 />,
          tone: 'danger',
          onSelect: () =>
            void confirm({
              title: t('roles.delete.title', { name: role.name }),
              message: t('roles.delete.message'),
              confirmLabel: t('roles.delete.confirm'),
              tone: 'danger',
            }).then((ok) => {
              if (ok) remove.mutate(role.id);
            }),
        });
      }
      return items;
    };
    return [
      {
        colId: 'name',
        headerName: t('roles.col.role'),
        sortable: true,
        flex: 1.6,
        minWidth: 200,
        lockVisible: true,
        cellRenderer: ({ data }: { data?: RoleSummary }) =>
          data ? (
            <span className="flex h-full items-center gap-2">
              <span className="font-medium text-neutral-900">{data.name}</span>
              {data.isLocked && <Badge tone="primary">{t('roles.locked')}</Badge>}
            </span>
          ) : null,
      },
      {
        colId: 'menus',
        headerName: t('roles.col.menus'),
        width: 170,
        valueGetter: ({ data }) =>
          data ? (data.menuCount === null ? t('roles.all') : data.menuCount) : '',
        cellClass: 'tabular-nums',
      },
      {
        colId: 'users',
        headerName: t('roles.col.staff'),
        width: 110,
        valueGetter: ({ data }) => data?.userCount ?? 0,
        cellClass: 'tabular-nums',
      },
      {
        colId: 'createdAt',
        headerName: t('roles.col.created'),
        sortable: true,
        width: 150,
        cellRenderer: ({ data }: { data?: RoleSummary }) =>
          data ? <DateCell value={data.createdAt} /> : null,
      },
      {
        colId: 'actions',
        headerName: '',
        width: 64,
        lockVisible: true,
        resizable: false,
        cellRenderer: ({ data }: { data?: RoleSummary }) =>
          data ? (
            <ActionsCell
              label={t('roles.actionsFor', { name: data.name })}
              items={actionsFor(data)}
            />
          ) : null,
      },
    ];
    // `open` only closes over navigate and basePath.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, canUpdate, canDelete, confirm, remove.mutate, navigate, basePath]);

  return (
    <PageLayout
      bleed
      title={t('roles.list.title')}
      description={t('roles.list.description')}
      actions={
        canCreate && (
          <Button variant="primary" icon={<LuPlus />} onClick={create}>
            {t('roles.list.new')}
          </Button>
        )
      }
    >
      <DataGrid<RoleSummary>
        id="roles"
        label={t('roles.list.title')}
        columnDefs={columns}
        rows={query.data?.data}
        getRowId={(r) => r.id}
        loading={query.isFetching}
        error={query.error}
        errorMessage={query.error ? userMessage(query.error) : undefined}
        onRetry={() => void query.refetch()}
        sort={params.sort}
        onSortChange={grid.setSort}
        onRowClicked={(r) => open(r.id)}
        filtered={grid.hasFilters}
        paging={{
          page: params.page,
          pageSize: params.pageSize,
          total: query.data?.meta.total ?? 0,
          onPageChange: grid.setPage,
          onPageSizeChange: grid.setPageSize,
        }}
        toolbar={
          <GridSearch
            value={params.q}
            onChange={grid.setQuery}
            placeholder={t('roles.list.search')}
            label={t('roles.list.search')}
          />
        }
        empty={
          <EmptyState
            icon={<LuShieldCheck />}
            title={t('roles.empty.title')}
            description={t('roles.empty.message')}
            action={
              canCreate && (
                <Button variant="primary" icon={<LuPlus />} onClick={create}>
                  {t('roles.list.new')}
                </Button>
              )
            }
          />
        }
        emptyFiltered={
          <EmptyState
            title={t('roles.emptyFiltered.title')}
            action={
              <Button size="sm" onClick={grid.clearFilters}>
                {t('roles.clearSearch')}
              </Button>
            }
          />
        }
      />
    </PageLayout>
  );
}
