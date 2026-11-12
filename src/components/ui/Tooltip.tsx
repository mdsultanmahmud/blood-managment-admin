import { useId, useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lightweight tooltip for icon-only controls. Shows on hover and keyboard focus, and is wired
 * with aria-describedby. `disabled` renders the child alone (e.g. sidebar expanded).
 */
export function Tooltip({
  label,
  side = 'right',
  disabled = false,
  children,
}: {
  label: ReactNode;
  side?: 'right' | 'top' | 'bottom';
  disabled?: boolean;
  children: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (disabled) return children;
  return (
    <span
      className="relative inline-flex w-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 rounded-sm bg-neutral-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white',
            side === 'right' && 'top-1/2 left-full ml-2 -translate-y-1/2',
            side === 'top' && 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
            side === 'bottom' && 'top-full left-1/2 mt-1.5 -translate-x-1/2',
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
