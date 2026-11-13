import type { AxiosRequestConfig } from 'axios';
import type { z } from 'zod';
import { http } from './client';
import { toApiError } from './errors';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * One typed request: sends, unwraps `{ data }` (or keeps `{ data, meta }` for lists when
 * `envelope` is set) and validates the response shape against a Zod schema.
 */
export async function request<S extends z.ZodType>(
  method: Method,
  url: string,
  schema: S,
  options: {
    body?: unknown;
    params?: object;
    envelope?: boolean;
    config?: AxiosRequestConfig;
  } = {},
): Promise<z.infer<S>> {
  try {
    const res = await http.request<{ data: unknown }>({
      method,
      url,
      data: options.body,
      params: options.params,
      ...options.config,
    });
    const payload: unknown = options.envelope ? res.data : res.data.data;
    return schema.parse(payload);
  } catch (err) {
    throw toApiError(err);
  }
}

/** For 204 responses. */
export async function send(
  method: Method,
  url: string,
  body?: unknown,
  config: AxiosRequestConfig = {},
): Promise<void> {
  try {
    await http.request({ method, url, data: body, ...config });
  } catch (err) {
    throw toApiError(err);
  }
}

/** A protected file as a Blob (the bearer token rides on the shared instance). */
export async function requestBlob(url: string, config: AxiosRequestConfig = {}): Promise<Blob> {
  try {
    const res = await http.request<Blob>({ method: 'get', url, responseType: 'blob', ...config });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** Drops empty filter values so query strings stay clean. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>;
}
