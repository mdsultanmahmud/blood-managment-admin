import i18n from 'i18next';
import { toApiError } from '@/api/errors';
import { tx } from './translate';

/**
 * A translated message for any failure. A code with its own key (`errors.<CODE>`) wins; otherwise
 * the status class decides. The backend's English message is never shown (ADR 0022).
 */
export function userMessage(error: unknown): string {
  const e = toApiError(error);
  if (e.isNetwork) return i18n.t('errors.network');
  const specific = tx(`errors.${e.code}`, '');
  if (specific) return specific;
  if (e.status === 401) return i18n.t('errors.sessionEnded');
  if (e.status === 403) return i18n.t('errors.forbidden');
  if (e.status === 404) return i18n.t('errors.notFound');
  if (e.status === 429) return i18n.t('errors.tooManyRequests');
  if (e.status >= 500) return i18n.t('errors.server');
  return i18n.t('errors.unknown');
}
