import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 hover:border-primary-700 active:bg-primary-800',
  secondary:
    'bg-surface text-neutral-800 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100',
  ghost:
    'bg-transparent text-neutral-700 border-transparent hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
  danger:
    'bg-danger-600 text-white border-danger-600 hover:bg-danger-700 hover:border-danger-700 active:bg-danger-800',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
};

const ICON_ONLY: Record<ButtonSize, string> = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11' };

/** Flat button with `rounded-sm`. Loading keeps the width and disables double submit. */
export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconOnly = false,
  disabled,
  className,
  children,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-sm border font-medium whitespace-nowrap transition-colors duration-100 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        iconOnly ? ICON_ONLY[size] : SIZES[size],
        className,
      )}
      {...rest}
    >
      <span className={cn('inline-flex items-center gap-[inherit]', loading && 'invisible')}>
        {icon && (
          <span className="inline-flex text-[1.1em]" aria-hidden>
            {icon}
          </span>
        )}
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 inline-flex items-center justify-center">
          <Spinner size={16} />
        </span>
      )}
    </button>
  );
}
