import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { type Toast } from 'react-hot-toast';
import { LuCheck, LuCircleAlert, LuCopy, LuInfo, LuX } from 'react-icons/lu';
import { cn } from '@/lib/cn';

export type Tone = 'success' | 'error' | 'info';

export interface NotifyOptions {
  /** Backend request id: adds a "Copy details" action for support. */
  requestId?: string | undefined;
  /** Extra line under the message. */
  detail?: string | undefined;
  duration?: number;
}

const TONE = {
  success: { icon: LuCheck, bar: 'bg-success-600', iconClass: 'text-success-700' },
  error: { icon: LuCircleAlert, bar: 'bg-danger-600', iconClass: 'text-danger-700' },
  info: { icon: LuInfo, bar: 'bg-info-600', iconClass: 'text-info-700' },
} as const;

function CopyDetails({ message, requestId }: { message: string; requestId: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
      onClick={() => {
        if (!('clipboard' in navigator)) return;
        void navigator.clipboard
          .writeText(
            t('common.toast.details', { message, requestId, time: new Date().toISOString() }),
          )
          .then(() => setCopied(true));
      }}
    >
      <LuCopy aria-hidden /> {copied ? t('common.toast.copied') : t('common.toast.copyDetails')}
    </button>
  );
}

export function ToastCard({
  t,
  tone,
  message,
  opts,
}: {
  t: Toast;
  tone: Tone;
  message: string;
  opts: NotifyOptions;
}) {
  const { t: translate } = useTranslation();
  const { icon: Icon, bar, iconClass } = TONE[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto relative flex w-[360px] max-w-[calc(100vw-2rem)] gap-3 overflow-hidden rounded-md border border-neutral-200 bg-surface py-3 pr-3 pl-4 shadow-layer transition-all duration-150',
        t.visible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-[3px]', bar)} aria-hidden />
      <Icon className={cn('mt-0.5 shrink-0 text-base', iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900">{message}</p>
        {opts.detail && <p className="mt-0.5 text-[13px] text-neutral-600">{opts.detail}</p>}
        {opts.requestId && <CopyDetails message={message} requestId={opts.requestId} />}
      </div>
      <button
        type="button"
        aria-label={translate('common.actions.dismiss')}
        onClick={() => toast.dismiss(t.id)}
        className="-mt-0.5 h-6 w-6 shrink-0 rounded-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
      >
        <LuX className="mx-auto" aria-hidden />
      </button>
    </div>
  );
}
