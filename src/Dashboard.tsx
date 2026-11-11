import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Droplet,
  HeartHandshake,
  Hospital,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

type Urgency = 'CRITICAL' | 'URGENT' | 'MODERATE';
type RequestStatus = 'PENDING' | 'VERIFIED' | 'FULFILLED';

interface BloodRequest {
  id: number;
  patient: string;
  hospital: string;
  location: string;
  bloodGroup: string;
  urgency: Urgency;
  units: string;
  neededBy: string;
  status: RequestStatus;
}

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 1,
    patient: 'Rahim Chowdhury',
    hospital: 'Dhaka Medical College Hospital',
    location: 'Dhaka',
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
    location: 'Rajshahi',
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
    location: 'Chittagong',
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
    location: 'Dhaka',
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
    location: 'Sylhet',
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

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Blood Requests', icon: AlertTriangle, active: false },
  { label: 'Donors', icon: Users, active: false },
  { label: 'Blood Banks', icon: Hospital, active: false },
  { label: 'Settings', icon: Settings, active: false },
];

const STATS = [
  { label: 'Registered Donors', value: '54,200', icon: Users, tone: 'text-rose-600 bg-rose-50' },
  {
    label: 'Lives Saved',
    value: '128,500',
    icon: HeartHandshake,
    tone: 'text-slate-900 bg-slate-100',
  },
  { label: 'Districts Covered', value: '64 / 64', icon: MapPin, tone: 'text-rose-600 bg-rose-50' },
  { label: 'Active Requests', value: '14', icon: Activity, tone: 'text-emerald-600 bg-emerald-50' },
];

const URGENCY_STYLE: Record<Urgency, string> = {
  CRITICAL: 'bg-rose-600 text-white',
  URGENT: 'bg-amber-100 text-amber-800',
  MODERATE: 'bg-slate-100 text-slate-700',
};

const STATUS_STYLE: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FULFILLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Pending review',
  VERIFIED: 'Hospital verified',
  FULFILLED: 'Fulfilled',
};

function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-rose-600 to-red-500 text-white shadow-lg shadow-rose-500/30">
        <Droplet className="h-6 w-6 fill-current" />
      </div>
      <div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-black tracking-tight text-white">
            Rokto<span className="text-rose-500">Life</span>
          </span>
          <span className="rounded-full border border-rose-900 bg-rose-950 px-1.5 py-0.5 text-xs font-semibold text-rose-400">
            Admin
          </span>
        </div>
        <p className="-mt-1 text-[10px] font-medium text-slate-400">রক্তদানে জীবন বাঁচুক</p>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-slate-950 px-4 py-6">
      <Logo />
      <nav className="mt-10 flex-1 space-y-1">
        {NAV.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            onClick={onNavigate}
            className={`flex w-full cursor-pointer items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="rounded-xl border border-rose-900/60 bg-rose-950/60 p-3 text-xs text-rose-400">
        National Emergency: <span className="font-bold text-white">Call 999</span>
      </div>
      <button
        type="button"
        className="mt-4 flex cursor-pointer items-center space-x-3 px-3 py-2 text-sm font-semibold text-slate-400 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </button>
    </div>
  );
}

export function Dashboard() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-500 selection:text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 cursor-pointer bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen((o) => !o)}
                className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Overview of blood requests, donors and stock across Bangladesh
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                aria-label="Notifications"
                className="relative cursor-pointer rounded-xl border border-slate-200 bg-slate-100/70 p-2.5 text-slate-600 hover:bg-slate-100"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-600" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-rose-500">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats */}
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {STATS.map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-black text-slate-900">{value}</div>
                <div className="mt-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {label}
                </div>
              </div>
            ))}
          </section>

          <div className="grid gap-8 xl:grid-cols-3">
            {/* Requests table */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center space-x-2 text-xs font-bold tracking-widest text-rose-600 uppercase">
                    <Activity className="h-4 w-4" />
                    <span>Real-Time Request Feed</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Live Emergency Requests</h2>
                </div>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search patient, hospital, group"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 sm:w-72"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-170 text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold tracking-wider text-slate-400 uppercase">
                      <th className="pr-4 pb-3">Group</th>
                      <th className="pr-4 pb-3">Patient / Hospital</th>
                      <th className="pr-4 pb-3">Urgency</th>
                      <th className="pr-4 pb-3">Needed by</th>
                      <th className="pr-4 pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 pr-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-600 text-base font-black text-white shadow-md shadow-rose-600/20">
                            {r.bloodGroup}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-bold text-slate-900">{r.patient}</div>
                          <div className="flex items-center text-xs font-medium text-slate-500">
                            <Hospital className="mr-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {r.hospital}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black tracking-wider uppercase ${URGENCY_STYLE[r.urgency]}`}
                          >
                            {r.urgency}
                          </span>
                          <div className="mt-1 text-xs font-semibold text-slate-500">{r.units}</div>
                        </td>
                        <td className="py-4 pr-4 text-xs font-bold text-rose-600">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            {r.neededBy}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}
                          >
                            {r.status === 'VERIFIED' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {STATUS_LABEL[r.status]}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {r.status === 'FULFILLED' ? (
                            <span className="text-xs font-semibold text-slate-400">Done</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => advance(r.id)}
                              className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-600"
                            >
                              {r.status === 'PENDING' ? 'Verify' : 'Mark fulfilled'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visible.length === 0 && (
                  <p className="py-10 text-center text-sm font-semibold text-slate-500">
                    No requests match your search.
                  </p>
                )}
              </div>
            </section>

            {/* Right column */}
            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-sm">
                <span className="mb-1 block text-xs font-bold tracking-widest text-rose-500 uppercase">
                  Blood stock
                </span>
                <h2 className="mb-5 text-xl font-black">Availability by Group</h2>
                <ul className="space-y-3">
                  {STOCK.map(({ group, percent }) => (
                    <li key={group} className="flex items-center space-x-3">
                      <span className="w-10 text-sm font-black text-slate-200">{group}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-full rounded-full ${percent < 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${String(percent)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-slate-400">
                        {percent}%
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-slate-400">
                  Groups below 30% are shown in red and need new donors.
                </p>
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <span className="mb-1 block text-xs font-bold tracking-widest text-rose-600 uppercase">
                  Verified network
                </span>
                <h2 className="mb-5 text-xl font-black text-slate-900">New Donors</h2>
                <ul className="space-y-4">
                  {RECENT_DONORS.map((d) => (
                    <li key={d.name} className="flex items-center space-x-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-base font-black text-rose-500">
                        {d.group}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-slate-900">{d.name}</div>
                        <div className="flex items-center text-xs font-medium text-slate-500">
                          <MapPin className="mr-1 h-3 w-3 text-slate-400" />
                          {d.district}, BD
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{d.when}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
