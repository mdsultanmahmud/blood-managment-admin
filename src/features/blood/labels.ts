import type { AutocompleteOption } from '@/components/form/FormAutocomplete';
import type { BadgeTone } from '@/components/ui/Badge';
import type { BloodGroup, DonorStatus, RequestStatus, Urgency } from '@/api/modules/blood';
import { BLOOD_GROUPS, URGENCIES } from '@/api/modules/blood';

/** App hub menu keys of this app's pages; each is also the permission key. Never rename them. */
export const DASHBOARD_MENU = 'dashboard';
export const REQUESTS_MENU = 'blood_requests';
export const DONORS_MENU = 'blood_donors';
export const BANKS_MENU = 'blood_banks';
export const STOCK_MENU = 'blood_stock';

/** i18n keys by value, written out so the key checker sees every one of them. */
export const GROUP_KEY = {
  A_POS: 'blood.group.A_POS',
  A_NEG: 'blood.group.A_NEG',
  B_POS: 'blood.group.B_POS',
  B_NEG: 'blood.group.B_NEG',
  AB_POS: 'blood.group.AB_POS',
  AB_NEG: 'blood.group.AB_NEG',
  O_POS: 'blood.group.O_POS',
  O_NEG: 'blood.group.O_NEG',
} as const satisfies Record<BloodGroup, string>;

export const URGENCY_KEY = {
  CRITICAL: 'blood.urgency.CRITICAL',
  URGENT: 'blood.urgency.URGENT',
  MODERATE: 'blood.urgency.MODERATE',
} as const satisfies Record<Urgency, string>;

export const URGENCY_TONE: Record<Urgency, BadgeTone> = {
  CRITICAL: 'danger',
  URGENT: 'warning',
  MODERATE: 'neutral',
};

export const REQUEST_STATUS_KEY = {
  PENDING: 'blood.requestStatus.PENDING',
  VERIFIED: 'blood.requestStatus.VERIFIED',
  FULFILLED: 'blood.requestStatus.FULFILLED',
  REJECTED: 'blood.requestStatus.REJECTED',
} as const satisfies Record<RequestStatus, string>;

export const REQUEST_STATUS_TONE: Record<RequestStatus, BadgeTone> = {
  PENDING: 'warning',
  VERIFIED: 'info',
  FULFILLED: 'success',
  REJECTED: 'neutral',
};

export const DONOR_STATUS_KEY = {
  PENDING: 'blood.donorStatus.PENDING',
  VERIFIED: 'blood.donorStatus.VERIFIED',
} as const satisfies Record<DonorStatus, string>;

export const DONOR_STATUS_TONE: Record<DonorStatus, BadgeTone> = {
  PENDING: 'warning',
  VERIFIED: 'success',
};

type Translate = (key: (typeof GROUP_KEY)[BloodGroup] | (typeof URGENCY_KEY)[Urgency]) => string;

export const groupOptions = (t: Translate): AutocompleteOption[] =>
  BLOOD_GROUPS.map((g) => ({ value: g, label: t(GROUP_KEY[g]) }));

export const urgencyOptions = (t: Translate): AutocompleteOption[] =>
  URGENCIES.map((u) => ({ value: u, label: t(URGENCY_KEY[u]) }));

/** `datetime-local` value (local time, no zone) from an ISO instant. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(d.getFullYear())}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO instant (with the zone) from a `datetime-local` value. */
export const fromLocalInput = (local: string): string => new Date(local).toISOString();
