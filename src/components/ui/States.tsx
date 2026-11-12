import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuCircleAlert, LuInbox } from 'react-icons/lu';
import { Button } from './Button';
import { Spinner } from './Spinner';

/** An empty screen is an invitation to act: say what goes here and offer the action. */
export function EmptyState({
  title,
  description,
  action,
  icon = <LuInbox />,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 text-2xl text-neutral-400" aria-hidden>
        {icon}
      </span>
      <p className="text-[15px] font-semibold text-neutral-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Inline error with retry; queries show this, not only a toast. */
export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <LuCircleAlert className="mb-3 text-2xl text-danger-600" aria-hidden />
      <p className="text-[15px] font-semibold text-neutral-900">
        {title ?? t('status.loadFailed.title')}
      </p>
      {message && <p className="mt-1 max-w-md text-sm text-neutral-600">{message}</p>}
      {onRetry && (
        <Button className="mt-4" size="sm" onClick={onRetry}>
          {t('common.actions.retry')}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation();
  const text = label ?? t('common.loading');
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-sm text-neutral-600">
      <Spinner label={text} />
      <span aria-hidden>{text}</span>
    </div>
  );
}
