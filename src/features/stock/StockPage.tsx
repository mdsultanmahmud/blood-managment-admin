import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LuPencil } from 'react-icons/lu';
import { bloodApi, type StockRow } from '@/api/modules/blood';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/components/ui/PageLayout';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { useModal } from '@/context/modalTypes';
import { formatRelative } from '@/lib/format';
import { permissionKey } from '@/lib/permissions';
import { queryKeys } from '@/lib/queryClient';
import { GROUP_KEY, STOCK_MENU } from '../blood/labels';
import { StockForm } from './StockForm';

/** Bags in stock for each blood group, against the target to keep. */
export default function StockPage() {
  const { t } = useTranslation();
  const { can } = useAuth();
  const { openModal } = useModal();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.stock, queryFn: bloodApi.stock });
  const canUpdate = can(permissionKey(STOCK_MENU, 'update'));

  const edit = async (row: StockRow) => {
    const saved = await openModal<StockRow>({
      title: t('stock.form.title', { group: t(GROUP_KEY[row.bloodGroup]) }),
      content: <StockForm row={row} />,
    });
    if (saved) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.stock });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    }
  };

  return (
    <PageLayout title={t('stock.title')} description={t('stock.description')}>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {query.data.map((row) => (
            <li
              key={row.bloodGroup}
              className="rounded-2xl border border-neutral-200 bg-surface p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-lg font-black text-white">
                  {t(GROUP_KEY[row.bloodGroup])}
                </div>
                {canUpdate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<LuPencil />}
                    onClick={() => void edit(row)}
                    aria-label={t('stock.edit', { group: t(GROUP_KEY[row.bloodGroup]) })}
                  />
                )}
              </div>
              <p className="mt-4 text-3xl font-black text-neutral-900 tabular-nums">
                {row.unitsAvailable}
                <span className="text-base font-semibold text-neutral-400">
                  {' '}
                  / {row.unitsTarget}
                </span>
              </p>
              <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                {t('stock.bags')}
              </p>
              <div
                className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-100"
                role="progressbar"
                aria-valuenow={row.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('stock.level', { group: t(GROUP_KEY[row.bloodGroup]) })}
              >
                <div
                  className={`h-full rounded-full ${row.percent < 30 ? 'bg-danger-500' : 'bg-success-500'}`}
                  style={{ width: `${String(row.percent)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {row.updatedAt
                  ? t('stock.updated', { when: formatRelative(row.updatedAt) })
                  : t('stock.notSet')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
