import { z } from 'zod';
import { appApi } from '../client';
import { cleanParams, request, send } from '../request';
import { pageMetaSchema } from '../schemas';

export const BLOOD_GROUPS = [
  'A_POS',
  'A_NEG',
  'B_POS',
  'B_NEG',
  'AB_POS',
  'AB_NEG',
  'O_POS',
  'O_NEG',
] as const;
export const URGENCIES = ['CRITICAL', 'URGENT', 'MODERATE'] as const;
export const REQUEST_STATUSES = ['PENDING', 'VERIFIED', 'FULFILLED', 'REJECTED'] as const;
export const DONOR_STATUSES = ['PENDING', 'VERIFIED'] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];
export type Urgency = (typeof URGENCIES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type DonorStatus = (typeof DONOR_STATUSES)[number];

const source = z.enum(['ADMIN', 'PUBLIC']);

export const donorSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  bloodGroup: z.enum(BLOOD_GROUPS),
  district: z.string(),
  lastDonatedOn: z.string().nullable(),
  isAvailable: z.boolean(),
  status: z.enum(DONOR_STATUSES),
  source,
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Donor = z.infer<typeof donorSchema>;

export const bloodRequestSchema = z.object({
  id: z.string(),
  patientName: z.string(),
  hospital: z.string(),
  district: z.string(),
  bloodGroup: z.enum(BLOOD_GROUPS),
  units: z.number(),
  urgency: z.enum(URGENCIES),
  neededBy: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  reason: z.string().nullable(),
  status: z.enum(REQUEST_STATUSES),
  source,
  verifiedAt: z.string().nullable(),
  fulfilledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BloodRequest = z.infer<typeof bloodRequestSchema>;

export const bloodBankSchema = z.object({
  id: z.string(),
  name: z.string(),
  district: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  notes: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BloodBank = z.infer<typeof bloodBankSchema>;

export const stockRowSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  unitsAvailable: z.number(),
  unitsTarget: z.number(),
  percent: z.number(),
  updatedAt: z.string().nullable(),
});
export type StockRow = z.infer<typeof stockRowSchema>;

export const dashboardSchema = z.object({
  stats: z.object({
    registeredDonors: z.number(),
    pendingDonors: z.number(),
    fulfilledRequests: z.number(),
    activeRequests: z.number(),
    pendingRequests: z.number(),
    districtsCovered: z.number(),
  }),
  stock: z.array(stockRowSchema),
  recentDonors: z.array(donorSchema),
});
export type Dashboard = z.infer<typeof dashboardSchema>;

const listOf = <S extends z.ZodType>(item: S) =>
  z.object({ data: z.array(item), meta: pageMetaSchema });
export type Page<T> = { data: T[]; meta: z.infer<typeof pageMetaSchema> };

export interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}
export interface RequestListParams extends ListParams {
  q?: string;
  status?: string;
}
export interface DonorListParams extends ListParams {
  name?: string;
  status?: string;
}
export interface BankListParams extends ListParams {
  q?: string;
}

export interface NewDonor {
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup;
  district: string;
  lastDonatedOn: string | null;
  isAvailable: boolean;
  status: DonorStatus;
  notes: string | null;
}
export interface NewRequest {
  patientName: string;
  hospital: string;
  district: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: Urgency;
  /** ISO date-time with an offset. */
  neededBy: string;
  contactName: string;
  contactPhone: string;
  reason: string | null;
}
export interface NewBank {
  name: string;
  district: string;
  address: string;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
}

export const bloodApi = {
  dashboard: () => request('get', '/dashboard', dashboardSchema, { config: appApi }),

  requests: (params: RequestListParams) =>
    request('get', '/requests', listOf(bloodRequestSchema), {
      params: cleanParams(params),
      envelope: true,
      config: appApi,
    }),
  createRequest: (body: NewRequest) =>
    request('post', '/requests', bloodRequestSchema, { body, config: appApi }),
  updateRequest: (id: string, body: Partial<NewRequest>) =>
    request('patch', `/requests/${id}`, bloodRequestSchema, { body, config: appApi }),
  changeRequestStatus: (id: string, status: RequestStatus) =>
    request('patch', `/requests/${id}/status`, bloodRequestSchema, {
      body: { status },
      config: appApi,
    }),
  removeRequest: (id: string) => send('delete', `/requests/${id}`, undefined, appApi),

  donors: (params: DonorListParams) =>
    request('get', '/donors', listOf(donorSchema), {
      params: cleanParams(params),
      envelope: true,
      config: appApi,
    }),
  createDonor: (body: NewDonor) =>
    request('post', '/donors', donorSchema, { body, config: appApi }),
  updateDonor: (id: string, body: Partial<NewDonor>) =>
    request('patch', `/donors/${id}`, donorSchema, { body, config: appApi }),
  removeDonor: (id: string) => send('delete', `/donors/${id}`, undefined, appApi),

  banks: (params: BankListParams) =>
    request('get', '/blood-banks', listOf(bloodBankSchema), {
      params: cleanParams(params),
      envelope: true,
      config: appApi,
    }),
  createBank: (body: NewBank) =>
    request('post', '/blood-banks', bloodBankSchema, { body, config: appApi }),
  updateBank: (id: string, body: Partial<NewBank>) =>
    request('patch', `/blood-banks/${id}`, bloodBankSchema, { body, config: appApi }),
  removeBank: (id: string) => send('delete', `/blood-banks/${id}`, undefined, appApi),

  stock: () => request('get', '/stock', z.array(stockRowSchema), { config: appApi }),
  saveStock: (group: BloodGroup, body: { unitsAvailable: number; unitsTarget: number }) =>
    request('put', `/stock/${group}`, stockRowSchema, { body, config: appApi }),
};
