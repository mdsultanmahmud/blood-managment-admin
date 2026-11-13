import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { installInterceptors } from './interceptors';
import { createRefreshCoordinator } from './refreshCoordinator';
import { tokenStore } from './tokenStore';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('refresh coordinator (single flight)', () => {
  it('shares one in-flight refresh between concurrent callers', async () => {
    const d = deferred<string>();
    const refresh = vi.fn(() => d.promise);
    const c = createRefreshCoordinator(refresh);
    const calls = [c.refresh(), c.refresh(), c.refresh()];
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(c.pending).toBe(true);
    d.resolve('t1');
    await expect(Promise.all(calls)).resolves.toEqual(['t1', 't1', 't1']);
    expect(c.pending).toBe(false);
  });

  it('starts a new refresh once the previous one settled', async () => {
    let n = 0;
    const c = createRefreshCoordinator(() => Promise.resolve(`t${++n}`));
    await expect(c.refresh()).resolves.toBe('t1');
    await expect(c.refresh()).resolves.toBe('t2');
  });

  it('propagates a failure to every waiter and resets', async () => {
    const d = deferred<string>();
    const c = createRefreshCoordinator(() => d.promise);
    const a = c.refresh();
    const b = c.refresh();
    d.reject(new Error('expired'));
    await expect(a).rejects.toThrow('expired');
    await expect(b).rejects.toThrow('expired');
    expect(c.pending).toBe(false);
  });
});

describe('axios interceptors: 401 -> refresh once -> retry', () => {
  const VALID = 'fresh-token';

  /** Fake server: 401 unless the request carries the fresh token. */
  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    const auth = config.headers.get('Authorization');
    if (auth === `Bearer ${VALID}`) {
      return Promise.resolve({
        data: { data: config.url },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
    const response = {
      data: { error: { code: 'TOKEN_EXPIRED', message: 'Access token expired', requestId: 'r1' } },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config,
    };
    return Promise.reject(new AxiosError('401', 'ERR_BAD_REQUEST', config, null, response));
  };

  beforeEach(() => tokenStore.set('stale-token'));

  it('concurrent 401s trigger exactly one refresh and all requests succeed on retry', async () => {
    const refresh = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 10));
      tokenStore.set(VALID);
      return VALID;
    });
    const onSessionExpired = vi.fn();
    const instance = installInterceptors(
      axios.create({ adapter }),
      createRefreshCoordinator(refresh),
      () => ({ onSessionExpired }),
    );

    const results = await Promise.all(
      ['/a', '/b', '/c'].map((u) => instance.get<{ data: string }>(u)),
    );
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.data.data)).toEqual(['/a', '/b', '/c']);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('a failed refresh ends the session once and rejects with the original ApiError', async () => {
    const refresh = vi.fn(() => Promise.reject(new Error('refresh token reused')));
    const onSessionExpired = vi.fn();
    const instance = installInterceptors(
      axios.create({ adapter }),
      createRefreshCoordinator(refresh),
      () => ({ onSessionExpired }),
    );

    const outcomes = await Promise.allSettled(['/a', '/b'].map((u) => instance.get(u)));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(tokenStore.get()).toBeNull();
    for (const o of outcomes) {
      expect(o.status).toBe('rejected');
      const reason = (o as PromiseRejectedResult).reason as ApiError;
      expect(reason).toBeInstanceOf(ApiError);
      expect(reason).toMatchObject({ status: 401, code: 'TOKEN_EXPIRED', requestId: 'r1' });
    }
  });

  it('never refreshes for the auth endpoints themselves', async () => {
    const refresh = vi.fn(() => Promise.resolve(VALID));
    const instance = installInterceptors(
      axios.create({ adapter }),
      createRefreshCoordinator(refresh),
    );
    await expect(instance.post('/auth/login')).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('retries a request only once', async () => {
    // Refresh "succeeds" but the token is still rejected: no infinite loop.
    const refresh = vi.fn(() => Promise.resolve('still-bad'));
    const instance = installInterceptors(
      axios.create({ adapter }),
      createRefreshCoordinator(refresh),
    );
    await expect(instance.get('/x')).rejects.toMatchObject({ status: 401 });
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
