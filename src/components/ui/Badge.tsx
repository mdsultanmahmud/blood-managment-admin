import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  neutral: { box: 'bg-neutral-100 text-neutral-700 border-neutral-200', dot: 'bg-neutral-500' },
  primary: { box: 'bg-primary-50 text-primary-800 border-primary-200', dot: 'bg-primary-600' },
  success: { box: 'bg-success-50 text-success-800 border-success-200', dot: 'bg-success-600' },
  warning: { box: 'bg-warning-50 text-warning-800 border-warning-200', dot: 'bg-warning-600' },
  danger: { box: 'bg-danger-50 text-danger-800 border-danger-200', dot: 'bg-danger-600' },
  info: { box: 'bg-info-50 text-info-800 border-info-200', dot: 'bg-info-600' },
};

/** Small label. `dot` shows a status dot so state is not conveyed by color alone. */
export function Badge({
  tone = 'neutral',
  dot = false,
  icon,
  children,
  className,
  title,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-sm border px-2 text-xs font-medium whitespace-nowrap',
        TONES[tone].box,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', TONES[tone].dot)} aria-hidden />}
      {icon && (
        <span className="inline-flex text-[13px]" aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
