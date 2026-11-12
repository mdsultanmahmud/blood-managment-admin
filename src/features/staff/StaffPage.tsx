import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColDef } from 'ag-grid-community';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LuKeyRound, LuPencil, LuPlus, LuUserCheck, LuUserX, LuUsers } from 'react-icons/lu';
import { staffApi, type Staff, type StaffStatus } from '@/api/modules/staff';
import {
  ActionsCell,
  AvatarNameCell,
  ChipsCell,
  DateCell,
  StatusCell,
} from '@/components/grid/cells';
import { DataGrid } from '@/components/grid/DataGrid';
import { GridFilterSelect, GridSearch } from '@/components/grid/GridControls';
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
import type { PageProps } from '@/routes/pages';
import { AddStaffForm, EditStaffForm, SetPasswordForm } from './StaffForms';
import { useRoleOptions } from './useRoleOptions';

const MENU = 'staff_management';
const FILTERS = ['status', 'roleId'] as const;

/** The company app's staff, laid out like BC's Staff users page. */
export default function StaffPage(_props: PageProps) {
  const { t } = useTranslation();
  const { can, me } = useAuth();
  const { openModal, confirm } = useModal();
  const queryClient = useQueryClient();
  const grid = useGridParams({ defaultSort: 'name', filterKeys: FILTERS });
  const { params } = grid;
  const query = useQuery({
    queryKey: [...queryKeys.staff, params],
    queryFn: () =>
      staffApi.list({
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        q: params.q,
        ...params.filters,
      }),
    placeholderData: keepPreviousData,
  });
  const roles = useRoleOptions();
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.staff }),
    [queryClient],
  );
  const setStatus = useMutation({
    mutationFn: (v: { staff: Staff; status: StaffStatus }) =>
      staffApi.update(v.staff.id, { status: v.status }),
    onSuccess: async (saved) => {
      notify.success(
        t(saved.status === 'DISABLED' ? 'staff.disabled' : 'staff.enabled', { name: saved.name }),
      );
      await refresh();
    },
    onError: (err) => notify.error(userMessage(err)),
  });

  const canCreate = can(permissionKey(MENU, 'create'));
  const canUpdate = can(permissionKey(MENU, 'update'));
  const selfId = me?.user.id;
  const statusMeta = useMemo(
    () => ({
      ACTIVE: { label: t('staff.status.active'), tone: 'success' as const },
      DISABLED: { label: t('staff.status.disabled'), tone: 'neutral' as const },
    }),
    [t],
  );

  const openAdd = useCallback(async () => {
    const saved = await openModal<Staff>({
      title: t('staff.form.addTitle'),
      content: <AddStaffForm />,
    });
    if (saved) await refresh();
  }, [openModal, refresh, t]);

  const columns = useMemo<ColDef<Staff>[]>(() => {
    const actionsFor = (s: Staff): MenuItemDef[] => {
      if (!canUpdate) return [];
      const items: MenuItemDef[] = [
        {
          key: 'edit',
          label: t('staff.action.edit'),
          icon: <LuPencil />,
          onSelect: () =>
            void openModal<Staff>({
              title: t('staff.form.editTitle', { name: s.name }),
              content: <EditStaffForm staff={s} />,
            }).then((saved) => saved && refresh()),
        },
      ];
      // Signing yourself out or locking yourself out is never offered.
      if (s.id === selfId) return items;
      items.push({
        key: 'password',
        label: t('staff.action.password'),
        icon: <LuKeyRound />,
        onSelect: () =>
          void openModal({
            title: t('staff.form.passwordTitle', { name: s.name }),
            content: <SetPasswordForm staff={s} />,
          }),
      });
      items.push(
        s.status === 'ACTIVE'
          ? {
              key: 'disable',
              label: t('staff.action.disable'),
              icon: <LuUserX />,
              tone: 'danger',
              onSelect: () =>
                void confirm({
                  title: t('staff.disable.title', { name: s.name }),
                  message: t('staff.disable.message'),
                  confirmLabel: t('staff.action.disable'),
                  tone: 'danger',
                }).then((ok) => {
                  if (ok) setStatus.mutate({ staff: s, status: 'DISABLED' });
                }),
            }
          : {
              key: 'enable',
              label: t('staff.action.enable'),
              icon: <LuUserCheck />,
              onSelect: () => setStatus.mutate({ staff: s, status: 'ACTIVE' }),
            },
      );
      return items;
    };
    return [
      {
        colId: 'name',
        headerName: t('staff.col.name'),
        sortable: true,
        flex: 2,
        minWidth: 220,
        lockVisible: true,
        cellRenderer: ({ data }: { data?: Staff }) =>
          data ? (
            <AvatarNameCell
              name={data.name}
              badge={
                data.id === selfId ? <Badge tone="primary">{t('staff.you')}</Badge> : undefined
              }
            />
          ) : null,
      },
      {
        colId: 'email',
        field: 'email',
        headerName: t('staff.col.email'),
        sortable: true,
        flex: 2,
        minWidth: 200,
      },
      {
        colId: 'roles',
        headerName: t('staff.col.roles'),
        flex: 2,
        minWidth: 180,
        cellRenderer: ({ data }: { data?: Staff }) =>
          data ? (
            <ChipsCell
              items={data.roles.map((r) => ({
                id: r.id,
                label: r.name,
                ...(r.isLocked ? { tone: 'primary' as const } : {}),
              }))}
              empty={t('staff.noRoles')}
            />
          ) : null,
      },
      {
        colId: 'status',
        headerName: t('staff.col.status'),
        width: 130,
        cellRenderer: ({ data }: { data?: Staff }) =>
          data ? (
            <StatusCell label={statusMeta[data.status].label} tone={statusMeta[data.status].tone} />
          ) : null,
      },
      {
        colId: 'lastLoginAt',
        headerName: t('staff.col.lastLogin'),
        sortable: true,
        width: 160,
        cellRenderer: ({ data }: { data?: Staff }) =>
          data ? <DateCell value={data.lastLoginAt} /> : null,
      },
      {
        colId: 'createdAt',
        headerName: t('staff.col.created'),
        sortable: true,
        width: 150,
        hide: true,
        cellRenderer: ({ data }: { data?: Staff }) =>
          data ? <DateCell value={data.createdAt} /> : null,
      },
      {
        colId: 'actions',
        headerName: '',
        width: 64,
        lockVisible: true,
        resizable: false,
        cellRenderer: ({ data }: { data?: Staff }) =>
          data ? (
            <ActionsCell
              label={t('staff.actionsFor', { name: data.name })}
              items={actionsFor(data)}
            />
          ) : null,
      },
    ];
  }, [t, canUpdate, selfId, statusMeta, openModal, confirm, refresh, setStatus]);

  return (
    <PageLayout
      bleed
      title={t('staff.list.title')}
      description={t('staff.list.description')}
      actions={
        canCreate && (
          <Button variant="primary" icon={<LuPlus />} onClick={() => void openAdd()}>
            {t('staff.list.add')}
          </Button>
        )
      }
    >
      <DataGrid<Staff>
        id="staff"
        label={t('staff.list.title')}
        columnDefs={columns}
        rows={query.data?.data}
        getRowId={(r) => r.id}
        loading={query.isFetching}
        error={query.error}
        errorMessage={query.error ? userMessage(query.error) : undefined}
        onRetry={() => void query.refetch()}
        sort={params.sort}
        onSortChange={grid.setSort}
        filtered={grid.hasFilters}
        paging={{
          page: params.page,
          pageSize: params.pageSize,
          total: query.data?.meta.total ?? 0,
          onPageChange: grid.setPage,
          onPageSizeChange: grid.setPageSize,
        }}
        toolbar={
          <>
            <GridSearch
              value={params.q}
              onChange={grid.setQuery}
              placeholder={t('staff.list.search')}
              label={t('staff.list.search')}
            />
            <GridFilterSelect
              label={t('staff.filter.status')}
              value={params.filters.status ?? ''}
              onChange={(v) => grid.setFilter('status', v)}
              options={[
                { value: 'ACTIVE', label: t('staff.status.active') },
                { value: 'DISABLED', label: t('staff.status.disabled') },
              ]}
              anyLabel={t('staff.filter.anyStatus')}
              width={150}
            />
            <GridFilterSelect
              label={t('staff.filter.role')}
              value={params.filters.roleId ?? ''}
              onChange={(v) => grid.setFilter('roleId', v)}
              options={roles.options.map((o) => ({ value: o.value, label: o.label }))}
              anyLabel={t('staff.filter.anyRole')}
              width={170}
            />
            {grid.hasFilters && (
              <Button variant="ghost" size="sm" onClick={grid.clearFilters}>
                {t('staff.clearFilters')}
              </Button>
            )}
          </>
        }
        empty={
          <EmptyState
            icon={<LuUsers />}
            title={t('staff.empty.title')}
            description={t('staff.empty.message')}
            action={
              canCreate && (
                <Button variant="primary" icon={<LuPlus />} onClick={() => void openAdd()}>
                  {t('staff.list.add')}
                </Button>
              )
            }
          />
        }
        emptyFiltered={
          <EmptyState
            title={t('staff.emptyFiltered.title')}
            action={
              <Button size="sm" onClick={grid.clearFilters}>
                {t('staff.clearFilters')}
              </Button>
            }
          />
        }
      />
    </PageLayout>
  );
}
