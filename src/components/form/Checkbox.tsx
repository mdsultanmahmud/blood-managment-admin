import { useEffect, useRef, type InputHTMLAttributes, type Ref } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /** Shows the mixed state; the native `checked` value is unchanged. */
  indeterminate?: boolean;
  /** `warning` colors the box for sensitive permissions. */
  tone?: 'primary' | 'warning';
  inputRef?: Ref<HTMLInputElement>;
}

function setRefs<T>(node: T | null, ...refs: (Ref<T> | undefined)[]) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: T | null }).current = node;
  }
}

/** Native checkbox colored by the theme (`accent-color`). Keyboard and screen reader behavior is the browser's. */
export function Checkbox({
  indeterminate = false,
  tone = 'primary',
  inputRef,
  className,
  ...rest
}: CheckboxProps) {
  const own = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (own.current) own.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      {...rest}
      ref={(node) => {
        own.current = node;
        setRefs(node, inputRef);
      }}
      type="checkbox"
      className={cn(
        'h-4 w-4 shrink-0 cursor-pointer rounded-sm disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'warning' ? 'accent-warning-600' : 'accent-primary-600',
        className,
      )}
    />
  );
}

/** On/off switch. A checkbox with `role="switch"`; pass `aria-label` when there is no visible label. */
export function Switch({
  className,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>) {
  return (
    <span className={cn('relative inline-flex h-5 w-9 shrink-0 items-center', className)}>
      <input
        {...rest}
        type="checkbox"
        role="switch"
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-600 peer-focus-visible:ring-offset-1 peer-disabled:opacity-50"
      />
      <span
        aria-hidden
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
      />
    </span>
  );
}
