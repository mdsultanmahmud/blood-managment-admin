import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  LuActivity,
  LuCircleCheck,
  LuClock,
  LuHeartHandshake,
  LuHospital,
  LuMapPin,
  LuUsers,
} from 'react-icons/lu';
import { Link } from 'react-router';
import { bloodApi, type BloodRequest } from '@/api/modules/blood';
import { Badge } from '@/components/ui/Badge';
import { PageLayout } from '@/components/ui/PageLayout';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { userMessage } from '@/lib/errors';
import { formatDateTime, formatRelative } from '@/lib/format';
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

const LATEST_REQUESTS = 5;

/** Landing page of the admin panel (menu key `dashboard`). */
export default function DashboardPage() {
  const { t } = useTranslation();
  const { can, routes } = useAuth();
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: queryKeys.dashboard, queryFn: bloodApi.dashboard });
  const canSeeRequests = can(permissionKey(REQUESTS_MENU, 'read'));
  const canUpdate = can(permissionKey(REQUESTS_MENU, 'update'));
  const requests = useQuery({
    queryKey: [...queryKeys.requests, 'latest'],
    queryFn: () => bloodApi.requests({ pageSize: LATEST_REQUESTS, sort: '-createdAt' }),
    enabled: canSeeRequests,
  });
  const requestsPath = routes.find((r) => r.key === REQUESTS_MENU)?.path;

  const advance = useMutation({
    mutationFn: (r: BloodRequest) =>
      bloodApi.changeRequestStatus(r.id, r.status === 'PENDING' ? 'VERIFIED' : 'FULFILLED'),
    onSuccess: async () => {
      notify.success(t('requests.statusChanged'));
      await queryClient.invalidateQueries({ queryKey: queryKeys.requests });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err) => notify.error(userMessage(err)),
  });

  if (dashboard.isPending) return <LoadingState />;
  if (dashboard.isError)
    return (
      <ErrorState
        onRetry={() => void dashboard.refetch()}
        message={userMessage(dashboard.error)}
      />
    );

  const { stats, stock, recentDonors } = dashboard.data;
  const cards = [
    {
      label: t('dashboard.stat.donors'),
      value: stats.registeredDonors,
      hint: t('dashboard.stat.donorsPending', { count: stats.pendingDonors }),
      icon: LuUsers,
      tone: 'text-primary-600 bg-primary-50',
    },
    {
      label: t('dashboard.stat.lives'),
      value: stats.fulfilledRequests,
      hint: undefined,
      icon: LuHeartHandshake,
      tone: 'text-neutral-900 bg-neutral-100',
    },
    {
      label: t('dashboard.stat.districts'),
      value: stats.districtsCovered,
      hint: undefined,
      icon: LuMapPin,
      tone: 'text-primary-600 bg-primary-50',
    },
    {
      label: t('dashboard.stat.active'),
      value: stats.activeRequests,
      hint: t('dashboard.stat.requestsPending', { count: stats.pendingRequests }),
      icon: LuActivity,
      tone: 'text-success-600 bg-success-50',
    },
  ];

  return (
    <PageLayout title={t('dashboard.title')} description={t('dashboard.description')}>
      <div className="space-y-8">
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {cards.map(({ label, value, hint, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-neutral-200 bg-surface p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="text-3xl font-black text-neutral-900 tabular-nums">
                {value.toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                {label}
              </div>
              {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
            </div>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-3">
          {canSeeRequests && (
            <section className="rounded-3xl border border-neutral-200 bg-surface p-6 xl:col-span-2">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-widest text-primary-600 uppercase">
                    <LuActivity className="h-4 w-4" aria-hidden />
                    <span>{t('dashboard.feed.eyebrow')}</span>
                  </div>
                  <h2 className="text-xl font-black text-neutral-900">
                    {t('dashboard.feed.title')}
                  </h2>
                </div>
                {requestsPath && (
                  <Link
                    to={requestsPath}
                    className="text-sm font-semibold text-primary-700 hover:underline"
                  >
                    {t('dashboard.feed.viewAll')}
                  </Link>
                )}
              </div>
              {requests.isPending ? (
                <LoadingState />
              ) : requests.isError ? (
                <ErrorState onRetry={() => void requests.refetch()} />
              ) : requests.data.data.length === 0 ? (
                <p className="py-10 text-center text-sm font-semibold text-neutral-500">
                  {t('dashboard.feed.empty')}
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {requests.data.data.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-base font-black text-white">
                        {t(GROUP_KEY[r.bloodGroup])}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-neutral-900">{r.patientName}</div>
                        <div className="flex items-center text-xs font-medium text-neutral-500">
                          <LuHospital className="mr-1 h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span className="truncate">
                            {r.hospital}, {r.district}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-xs font-semibold text-primary-600">
                          <LuClock className="mr-1 h-3.5 w-3.5" aria-hidden />
                          {formatDateTime(r.neededBy)} ·{' '}
                          {t('dashboard.feed.bags', { count: r.units })}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={URGENCY_TONE[r.urgency]}>{t(URGENCY_KEY[r.urgency])}</Badge>
                        <Badge tone={REQUEST_STATUS_TONE[r.status]} dot>
                          {t(REQUEST_STATUS_KEY[r.status])}
                        </Badge>
                      </div>
                      {canUpdate && (r.status === 'PENDING' || r.status === 'VERIFIED') && (
                        <button
                          type="button"
                          onClick={() => advance.mutate(r)}
                          disabled={advance.isPending}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <LuCircleCheck aria-hidden />
                          {r.status === 'PENDING'
                            ? t('requests.action.verify')
                            : t('requests.action.fulfil')}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <div className="space-y-8">
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-white">
              <span className="mb-1 block text-xs font-bold tracking-widest text-primary-400 uppercase">
                {t('dashboard.stock.eyebrow')}
              </span>
              <h2 className="mb-5 text-xl font-black">{t('dashboard.stock.title')}</h2>
              <ul className="space-y-3">
                {stock.map(({ bloodGroup, percent, unitsAvailable, unitsTarget }) => (
                  <li key={bloodGroup} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-black text-neutral-200">
                      {t(GROUP_KEY[bloodGroup])}
                    </span>
                    <div
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-700"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={t('stock.level', { group: t(GROUP_KEY[bloodGroup]) })}
                    >
                      <div
                        className={`h-full rounded-full ${percent < 30 ? 'bg-primary-500' : 'bg-success-500'}`}
                        style={{ width: `${String(percent)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs font-semibold text-neutral-400 tabular-nums">
                      {unitsAvailable}/{unitsTarget}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-neutral-400">{t('dashboard.stock.note')}</p>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-surface p-6">
              <span className="mb-1 block text-xs font-bold tracking-widest text-primary-600 uppercase">
                {t('dashboard.donors.eyebrow')}
              </span>
              <h2 className="mb-5 text-xl font-black text-neutral-900">
                {t('dashboard.donors.title')}
              </h2>
              {recentDonors.length === 0 ? (
                <p className="text-sm font-semibold text-neutral-500">
                  {t('dashboard.donors.empty')}
                </p>
              ) : (
                <ul className="space-y-4">
                  {recentDonors.map((d) => (
                    <li key={d.id} className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-base font-black text-primary-400">
                        {t(GROUP_KEY[d.bloodGroup])}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-neutral-900">
                          {d.fullName}
                        </div>
                        <div className="flex items-center text-xs font-medium text-neutral-500">
                          <LuMapPin className="mr-1 h-3 w-3 text-neutral-400" aria-hidden />
                          {t('dashboard.donors.place', { district: d.district })}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">
                        {formatRelative(d.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
