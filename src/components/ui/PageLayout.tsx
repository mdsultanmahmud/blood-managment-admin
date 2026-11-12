import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Every page uses this: left-aligned title, one-line description, actions on the right, and
 * the content below a rule. `bleed` lets grids run edge to edge.
 */
export function PageLayout({
  title,
  description,
  actions,
  meta,
  children,
  bleed = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small row under the title (e.g. status badges on a detail page). */
  meta?: ReactNode;
  children: ReactNode;
  bleed?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="flex min-h-full flex-col"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-neutral-200 bg-surface px-6 pt-6 pb-5 lg:px-8">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em] text-neutral-950">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-[68ch] text-sm text-neutral-600">{description}</p>
          )}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('flex-1', bleed ? '' : 'px-6 py-6 lg:px-8')}>{children}</div>
    </motion.div>
  );
}

/** A titled block inside a page, separated by spacing and a rule rather than a card shadow. */
export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-sm border border-neutral-200 bg-surface', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-3.5">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-neutral-600">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
