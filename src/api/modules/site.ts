import { request } from '../request';
import { siteSchema } from '../schemas';

export const siteApi = {
  /** The panel identifies its company by its own address (ADR 0020). */
  get: () => request('get', '/site', siteSchema, { params: { origin: window.location.origin } }),
};
