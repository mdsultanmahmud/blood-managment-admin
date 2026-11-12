/** The only place that reads import.meta.env. */
const rawApiUrl = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

export const env = {
  /** '' means same origin (Vite proxy in dev, reverse proxy in production). No trailing slash. */
  apiUrl: rawApiUrl.replace(/\/+$/, ''),
  isDev: import.meta.env.DEV,
} as const;

/** Turns a backend-relative path (e.g. the logo URL) into a URL the browser can load. */
export function apiUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
