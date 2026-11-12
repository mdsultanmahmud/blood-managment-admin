import { z } from 'zod';
import { cleanParams, request, send } from '../request';
import { navNodeSchema, pageMetaSchema } from '../schemas';

/** One row of a role: what it grants on one menu (ADR 0023). */
export const roleMenuSchema = z.object({
  menuKey: z.string(),
  visible: z.boolean(),
  read: z.boolean(),
  create: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
});
export type RoleMenu = z.infer<typeof roleMenuSchema>;

export const roleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isLocked: z.boolean(),
  /** Null for the Admin role, which covers every menu. */
  menuCount: z.number().nullable(),
  userCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RoleSummary = z.infer<typeof roleSummarySchema>;

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  isLocked: z.boolean(),
  menus: z.array(roleMenuSchema),
});
export type Role = z.infer<typeof roleSchema>;

export interface RoleBody {
  name: string;
  menus: RoleMenu[];
}

export interface RoleListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: string;
}

export const rolesApi = {
  /** The usable menu tree of the company app, which the matrix renders. */
  menus: async () =>
    (await request('get', '/access/menus', z.object({ items: z.array(navNodeSchema) }))).items,
  list: (params: RoleListParams) =>
    request('get', '/roles', z.object({ data: z.array(roleSummarySchema), meta: pageMetaSchema }), {
      params: cleanParams(params),
      envelope: true,
    }),
  get: (id: string) => request('get', `/roles/${id}`, roleSchema),
  create: (body: RoleBody) => request('post', '/roles', roleSchema, { body }),
  update: (id: string, body: RoleBody) => request('put', `/roles/${id}`, roleSchema, { body }),
  remove: (id: string) => send('delete', `/roles/${id}`),
};
