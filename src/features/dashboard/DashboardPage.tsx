import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LuActivity,
  LuCircleCheck,
  LuClock,
  LuHeartHandshake,
  LuHospital,
  LuMapPin,
  LuSearch,
  LuUsers,
} from 'react-icons/lu';
import { PageLayout } from '@/components/ui/PageLayout';

type Urgency = 'CRITICAL' | 'URGENT' | 'MODERATE';
type RequestStatus = 'PENDING' | 'VERIFIED' | 'FULFILLED';

interface BloodRequest {
  id: number;
  patient: string;
  hospital: string;
  bloodGroup: string;
  urgency: Urgency;
  units: string;
  neededBy: string;
  status: RequestStatus;
}

// Sample data until the blood-management backend app exists.
const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 1,
    patient: 'Rahim Chowdhury',
    hospital: 'Dhaka Medical College Hospital',
    bloodGroup: 'O-',
    urgency: 'CRITICAL',
    units: '2 Bags',
    neededBy: 'Today by 4:00 PM',
    status: 'PENDING',
  },
  {
    id: 2,
    patient: 'Nusrat Jahan',
    hospital: 'Rajshahi Medical College Hospital',
    bloodGroup: 'B-',
    urgency: 'URGENT',
    units: '1 Bag',
    neededBy: 'Within 5 Hours',
    status: 'VERIFIED',
  },
  {
    id: 3,
    patient: 'Tanvir Ahmed',
    hospital: 'Chittagong Medical College',
    bloodGroup: 'AB-',
    urgency: 'CRITICAL',
    units: '3 Bags',
    neededBy: 'Immediate (ICU)',
    status: 'PENDING',
  },
  {
    id: 4,
    patient: 'Sumaiya Begum',
    hospital: 'Square Hospital, Panthapath',
    bloodGroup: 'A+',
    urgency: 'MODERATE',
    units: '1 Bag',
    neededBy: 'Tomorrow 10:00 AM',
    status: 'VERIFIED',
  },
  {
    id: 5,
    patient: 'Arifur Rahman',
    hospital: 'Sylhet MAG Osmani Medical College',
    bloodGroup: 'O+',
    urgency: 'URGENT',
    units: '2 Bags',
    neededBy: 'Tonight',
    status: 'FULFILLED',
  },
];

const STOCK: { group: string; percent: number }[] = [
  { group: 'A+', percent: 78 },
  { group: 'A-', percent: 34 },
  { group: 'B+', percent: 65 },
  { group: 'B-', percent: 22 },
  { group: 'O+', percent: 88 },
  { group: 'O-', percent: 18 },
  { group: 'AB+', percent: 52 },
  { group: 'AB-', percent: 27 },
];

const RECENT_DONORS = [
  { name: 'Dr. Shakib Al Mamun', group: 'O-', district: 'Dhaka', when: '12 min ago' },
  { name: 'Sabrina Akter', group: 'B-', district: 'Chittagong', when: '1 hour ago' },
  { name: 'Kazi Farhan', group: 'AB+', district: 'Dhaka', when: '3 hours ago' },
  { name: 'Tariqul Islam', group: 'O+', district: 'Sylhet', when: 'Yesterday' },
];

const STATS = [
  {
    label: 'dashboard.stat.donors',
    value: '54,200',
    icon: LuUsers,
    tone: 'text-primary-600 bg-primary-50',
  },
  {
    label: 'dashboard.stat.lives',
    value: '128,500',
    icon: LuHeartHandshake,
    tone: 'text-neutral-900 bg-neutral-100',
  },
  {
    label: 'dashboard.stat.districts',
    value: '64 / 64',
    icon: LuMapPin,
    tone: 'text-primary-600 bg-primary-50',
  },
  {
    label: 'dashboard.stat.active',
    value: '14',
    icon: LuActivity,
    tone: 'text-success-600 bg-success-50',
  },
] as const;

const URGENCY_LABEL = {
  CRITICAL: 'dashboard.urgency.critical',
  URGENT: 'dashboard.urgency.urgent',
  MODERATE: 'dashboard.urgency.moderate',
} as const satisfies Record<Urgency, string>;

const URGENCY_STYLE: Record<Urgency, string> = {
  CRITICAL: 'bg-primary-600 text-white',
  URGENT: 'bg-warning-100 text-warning-800',
  MODERATE: 'bg-neutral-100 text-neutral-700',
};

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING: 'bg-warning-50 text-warning-700 border-warning-200',
  VERIFIED: 'bg-success-50 text-success-700 border-success-200',
  FULFILLED: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};

const STATUS_LABEL = {
  PENDING: 'dashboard.status.pending',
  VERIFIED: 'dashboard.status.verified',
  FULFILLED: 'dashboard.status.fulfilled',
} as const satisfies Record<RequestStatus, string>;

/** Landing page of the admin panel (menu key `dashboard`). */
export default function DashboardPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = requests.filter(
    (r) =>
      q === '' ||
      r.patient.toLowerCase().includes(q) ||
      r.hospital.toLowerCase().includes(q) ||
      r.bloodGroup.toLowerCase() === q,
  );

  function advance(id: number) {
    setRequests((prev) =>
      prev.map((r): BloodRequest => {
        if (r.id !== id) return r;
        if (r.status === 'PENDING') return { ...r, status: 'VERIFIED' };
        if (r.status === 'VERIFIED') return { ...r, status: 'FULFILLED' };
        return r;
      }),
    );
  }

  return (
    <PageLayout title={t('dashboard.title')} description={t('dashboard.description')}>
      <div className="space-y-8">
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-neutral-200 bg-surface p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="text-3xl font-black text-neutral-900">{value}</div>
              <div className="mt-1 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                {t(label)}
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-3">
          <section className="rounded-3xl border border-neutral-200 bg-surface p-6 xl:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-widest text-primary-600 uppercase">
                  <LuActivity className="h-4 w-4" aria-hidden />
                  <span>{t('dashboard.feed.eyebrow')}</span>
                </div>
                <h2 className="text-xl font-black text-neutral-900">{t('dashboard.feed.title')}</h2>
              </div>
              <div className="relative">
                <LuSearch
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('dashboard.search.placeholder')}
                  aria-label={t('dashboard.search.label')}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-2.5 pr-4 pl-9 text-sm font-semibold text-neutral-800 outline-none focus:bg-surface focus:ring-2 focus:ring-primary-500 sm:w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-170 text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                    <th className="pr-4 pb-3">{t('dashboard.col.group')}</th>
                    <th className="pr-4 pb-3">{t('dashboard.col.patient')}</th>
                    <th className="pr-4 pb-3">{t('dashboard.col.urgency')}</th>
                    <th className="pr-4 pb-3">{t('dashboard.col.neededBy')}</th>
                    <th className="pr-4 pb-3">{t('dashboard.col.status')}</th>
                    <th className="pb-3 text-right">{t('dashboard.col.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-base font-black text-white">
                          {r.bloodGroup}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-bold text-neutral-900">{r.patient}</div>
                        <div className="flex items-center text-xs font-medium text-neutral-500">
                          <LuHospital
                            className="mr-1 h-3.5 w-3.5 shrink-0 text-neutral-400"
                            aria-hidden
                          />
                          {r.hospital}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black tracking-wider uppercase ${URGENCY_STYLE[r.urgency]}`}
                        >
                          {t(URGENCY_LABEL[r.urgency])}
                        </span>
                        <div className="mt-1 text-xs font-semibold text-neutral-500">{r.units}</div>
                      </td>
                      <td className="py-4 pr-4 text-xs font-bold text-primary-600">
                        <span className="flex items-center">
                          <LuClock className="mr-1 h-3.5 w-3.5" aria-hidden />
                          {r.neededBy}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}
                        >
                          {r.status === 'VERIFIED' && (
                            <LuCircleCheck className="mr-1 h-3 w-3" aria-hidden />
                          )}
                          {t(STATUS_LABEL[r.status])}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {r.status === 'FULFILLED' ? (
                          <span className="text-xs font-semibold text-neutral-400">
                            {t('dashboard.action.done')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => advance(r.id)}
                            className="cursor-pointer rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-600"
                          >
                            {r.status === 'PENDING'
                              ? t('dashboard.action.verify')
                              : t('dashboard.action.fulfil')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length === 0 && (
                <p className="py-10 text-center text-sm font-semibold text-neutral-500">
                  {t('dashboard.empty')}
                </p>
              )}
            </div>
          </section>

          <div className="space-y-8">
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-white">
              <span className="mb-1 block text-xs font-bold tracking-widest text-primary-400 uppercase">
                {t('dashboard.stock.eyebrow')}
              </span>
              <h2 className="mb-5 text-xl font-black">{t('dashboard.stock.title')}</h2>
              <ul className="space-y-3">
                {STOCK.map(({ group, percent }) => (
                  <li key={group} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-black text-neutral-200">{group}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-700">
                      <div
                        className={`h-full rounded-full ${percent < 30 ? 'bg-primary-500' : 'bg-success-500'}`}
                        style={{ width: `${String(percent)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold text-neutral-400">
                      {percent}%
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
              <ul className="space-y-4">
                {RECENT_DONORS.map((d) => (
                  <li key={d.name} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-base font-black text-primary-400">
                      {d.group}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-neutral-900">{d.name}</div>
                      <div className="flex items-center text-xs font-medium text-neutral-500">
                        <LuMapPin className="mr-1 h-3 w-3 text-neutral-400" aria-hidden />
                        {t('dashboard.donors.place', { district: d.district })}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400">{d.when}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
