import { useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuCompass, LuTriangleAlert } from 'react-icons/lu';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Button } from '@/components/ui/Button';
import { isChunkLoadError, reloadForFreshChunks } from '@/lib/chunkReload';
import { env } from '@/lib/env';

function StatusPage({
  icon,
  code,
  title,
  message,
  detail,
  action,
}: {
  icon: ReactNode;
  code: string;
  title: string;
  message: string;
  detail?: string | undefined;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="max-w-md">
        <div className="flex items-center gap-3 text-neutral-500">
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
          <span className="text-sm font-medium tabular-nums">{code}</span>
        </div>
        <h1 className="mt-3 text-[26px] leading-tight font-semibold tracking-[-0.015em] text-neutral-950">
          {title}
        </h1>
        <p className="mt-2 text-[15px] text-neutral-600">{message}</p>
        {detail && (
          <pre className="mt-4 overflow-x-auto rounded-sm border border-danger-200 bg-danger-50 p-3 font-mono text-xs whitespace-pre-wrap text-danger-900">
            {detail}
          </pre>
        )}
        <div className="mt-6 flex gap-2">
          {action ?? (
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-sm border border-neutral-300 bg-surface px-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              {t('status.goHome')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <StatusPage
      icon={<LuCompass />}
      code="404"
      title={t('status.notFound.title')}
      message={t('status.notFound.message')}
    />
  );
}

/** Route-level errorElement: render crashes inside a page keep the shell usable. */
export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const chunkError = isChunkLoadError(error);
  const reloading = useMemo(() => chunkError && reloadForFreshChunks(), [chunkError]);
  useEffect(() => {
    if (!reloading) console.error('Route error', error);
  }, [error, reloading]);

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  if (reloading) return null;
  return (
    <StatusPage
      icon={<LuTriangleAlert />}
      code={t('status.errorCode')}
      title={t('status.routeError.title')}
      message={chunkError ? t('status.routeError.updated') : t('status.routeError.message')}
      detail={env.isDev && error instanceof Error ? `${error.name}: ${error.message}` : undefined}
      action={
        <Button variant="primary" onClick={() => window.location.reload()}>
          {t('common.actions.reload')}
        </Button>
      }
    />
  );
}
