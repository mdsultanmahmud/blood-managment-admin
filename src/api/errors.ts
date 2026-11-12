import { isAxiosError } from 'axios';

/** One field-level problem, from the backend's VALIDATION_ERROR `details` array. */
export interface FieldIssue {
  field: string;
  message: string;
}

/**
 * Normalized API failure. Every axios error is converted to this, so the rest of the app never
 * sees axios. Mirrors the backend envelope `{ error: { code, message, details?, requestId } }`.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  /** Field errors from a 422 `details` array (`path[0]` is the field), if any. */
  get fieldIssues(): FieldIssue[] {
    if (!Array.isArray(this.details)) return [];
    const out: FieldIssue[] = [];
    for (const d of this.details as unknown[]) {
      if (typeof d !== 'object' || d === null) continue;
      const { path, message } = d as { path?: unknown; message?: unknown };
      if (Array.isArray(path) && typeof path[0] === 'string' && typeof message === 'string') {
        out.push({ field: path.map(String).join('.'), message });
      }
    }
    return out;
  }
}

interface ErrorEnvelope {
  error?: { code?: unknown; message?: unknown; details?: unknown; requestId?: unknown };
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (isAxiosError(err)) {
    if (!err.response) {
      return new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection.');
    }
    const body = err.response.data as ErrorEnvelope | undefined;
    const e = body?.error;
    const requestId =
      typeof e?.requestId === 'string'
        ? e.requestId
        : (err.response.headers['x-request-id'] as string | undefined);
    return new ApiError(
      err.response.status,
      typeof e?.code === 'string' ? e.code : `HTTP_${err.response.status}`,
      typeof e?.message === 'string' ? e.message : err.message,
      e?.details,
      requestId,
    );
  }
  if (err instanceof Error) return new ApiError(-1, 'CLIENT_ERROR', err.message);
  return new ApiError(-1, 'CLIENT_ERROR', 'Something went wrong');
}
