import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toApiError } from './errors';
import type { RefreshCoordinator } from './refreshCoordinator';
import { tokenStore } from './tokenStore';

/** Requests that must never trigger a refresh-and-retry (the auth flow and the site lookup). */
const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout', '/site'];

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export interface ClientHooks {
  /** Called when a refresh fails: the session is over. */
  onSessionExpired: () => void;
}

let hooks: ClientHooks = { onSessionExpired: () => undefined };

/** AuthContext registers its logout/redirect handler here. */
export function setClientHooks(next: ClientHooks): void {
  hooks = next;
}

/**
 * Wires the interceptors onto an instance (exported for tests):
 * - attach the in-memory access token
 * - on 401, run ONE shared refresh, retry the request once, and end the session if that fails
 * - normalize every failure to ApiError
 */
export function installInterceptors(
  instance: AxiosInstance,
  coordinator: RefreshCoordinator,
  getHooks: () => ClientHooks = () => hooks,
): AxiosInstance {
  instance.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  instance.interceptors.response.use(undefined, async (error: unknown) => {
    const apiError = toApiError(error);
    const config = (error as { config?: RetriableConfig }).config;
    const url = config?.url ?? '';
    const eligible =
      apiError.status === 401 &&
      config &&
      !config._retried &&
      !NO_REFRESH.some((p) => url.endsWith(p));
    if (!eligible) throw apiError;

    config._retried = true;
    try {
      const token = await coordinator.refresh();
      config.headers.set('Authorization', `Bearer ${token}`);
    } catch {
      // Several requests may share this failed refresh; end the session only once.
      const hadSession = tokenStore.get() !== null;
      tokenStore.clear();
      if (hadSession) getHooks().onSessionExpired();
      throw apiError;
    }
    try {
      return await instance.request(config);
    } catch (retryError) {
      throw toApiError(retryError);
    }
  });
  return instance;
}
