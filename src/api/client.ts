import axios from 'axios';
import { env } from '@/lib/env';
import { installInterceptors } from './interceptors';
import { createRefreshCoordinator, type RefreshCoordinator } from './refreshCoordinator';
import { tokenStore } from './tokenStore';

export { setClientHooks } from './interceptors';

/** The company plane (ADR 0020); never BC's /api/v1/bc. */
export const API_PREFIX = '/api/v1/company';

/** App feature routes (ADR 0016): same company-plane token, another base path. */
export const APP_API_PREFIX = '/api/v1/apps/blood-management/admin';
export const appApi = { baseURL: `${env.apiUrl}${APP_API_PREFIX}` } as const;

/** Raw instance for the refresh call itself (no interceptors, so no recursion). */
const bare = axios.create({ baseURL: `${env.apiUrl}${API_PREFIX}`, withCredentials: true });

export async function refreshAccessToken(): Promise<string> {
  const res = await bare.post<{ data: { accessToken: string } }>('/auth/refresh', {});
  tokenStore.set(res.data.data.accessToken);
  return res.data.data.accessToken;
}

export const refreshCoordinator: RefreshCoordinator = createRefreshCoordinator(refreshAccessToken);

export const http = installInterceptors(
  axios.create({ baseURL: `${env.apiUrl}${API_PREFIX}`, withCredentials: true }),
  refreshCoordinator,
);

/** Unwraps the backend's `{ data }` envelope. */
export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  return (await promise).data.data;
}
