import { z } from 'zod';

/** GET /site: the company and app behind this admin URL. */
export const siteSchema = z.object({
  company: z.object({ name: z.string(), title: z.string(), logoUrl: z.string() }),
  app: z.object({ name: z.string(), slug: z.string() }),
  themeKey: z.string().nullable(),
  languages: z.array(z.string()).min(1),
  defaultLanguage: z.string(),
});
export type Site = z.infer<typeof siteSchema>;

const userSchema = z.object({ id: z.string(), name: z.string(), email: z.string() });

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
  user: userSchema,
});

/** GET /me: permissions are `<menuKey>:<action>` (ADR 0021). */
export const meSchema = z.object({
  user: userSchema,
  company: z.object({ id: z.string(), name: z.string() }),
  app: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  roles: z.array(z.string()),
  /** Holds the locked Admin role: may grant anything the company has. */
  isAdmin: z.boolean(),
  permissions: z.array(z.string()),
});
export type Me = z.infer<typeof meSchema>;

/** A page the user may open (GET /me/navigation `routes`), shown in the sidebar or not. */
export const routeSchema = z.object({ key: z.string(), path: z.string() });
export type AppRoute = z.infer<typeof routeSchema>;

/** The `meta` of list responses (`{ data, meta }`). */
export const pageMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

/** One node of GET /me/navigation (already filtered by the server). */
export interface NavNode {
  key: string;
  label: string;
  icon: string | null;
  path: string | null;
  children: NavNode[];
}
export const navNodeSchema: z.ZodType<NavNode> = z.lazy(() =>
  z.object({
    key: z.string(),
    label: z.string(),
    icon: z.string().nullable(),
    path: z.string().nullable(),
    children: z.array(navNodeSchema),
  }),
);
