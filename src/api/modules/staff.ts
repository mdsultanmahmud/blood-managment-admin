import { z } from 'zod';
import { cleanParams, request, send } from '../request';
import { pageMetaSchema } from '../schemas';

const staffRoleSchema = z.object({ id: z.string(), name: z.string(), isLocked: z.boolean() });

export const staffSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(['ACTIVE', 'DISABLED']),
  roles: z.array(staffRoleSchema),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Staff = z.infer<typeof staffSchema>;
export type StaffStatus = Staff['status'];

export interface StaffListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: string;
  status?: string;
  roleId?: string;
}

export interface NewStaff {
  name: string;
  email: string;
  password: string;
  roleIds: string[];
}

export const staffApi = {
  list: (params: StaffListParams) =>
    request('get', '/staff', z.object({ data: z.array(staffSchema), meta: pageMetaSchema }), {
      params: cleanParams(params),
      envelope: true,
    }),
  /** Role choices for the forms (GET /staff/roles needs only staff_management:read). */
  roles: async () =>
    (await request('get', '/staff/roles', z.object({ items: z.array(staffRoleSchema) }))).items,
  create: (body: NewStaff) => request('post', '/staff', staffSchema, { body }),
  update: (
    id: string,
    body: Partial<{ name: string; email: string; roleIds: string[]; status: StaffStatus }>,
  ) => request('patch', `/staff/${id}`, staffSchema, { body }),
  setPassword: (id: string, password: string) => send('put', `/staff/${id}/password`, { password }),
};
