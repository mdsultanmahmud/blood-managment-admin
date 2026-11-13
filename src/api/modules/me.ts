import { z } from 'zod';
import { request } from '../request';
import { meSchema, navNodeSchema, routeSchema } from '../schemas';

export const meApi = {
  get: () => request('get', '/me', meSchema),
  /** Sidebar items and every page the user may open. */
  navigation: () =>
    request(
      'get',
      '/me/navigation',
      z.object({ items: z.array(navNodeSchema), routes: z.array(routeSchema) }),
    ),
};
