import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';
import {
  CurrentModalContext,
  type ModalApi,
  type ModalSize,
  type OpenModalOptions,
} from '@/context/modalTypes';
import { cn } from '@/lib/cn';
import { Button } from '../ui/Button';

export interface ModalEntry {
  id: string;
  options: OpenModalOptions;
}

const DIALOG_WIDTH: Record<ModalSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[780px]',
};
const DRAWER_WIDTH: Record<ModalSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[540px]',
  lg: 'max-w-[760px]',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalHost({
  stack,
  onClose,
  onRequestClose,
  onSetDirty,
}: {
  stack: ModalEntry[];
  onClose: (id: string, result: unknown) => void;
  onRequestClose: (id: string) => void;
  onSetDirty: (id: string, dirty: boolean) => void;
}) {
  const topId = stack.at(-1)?.id;

  // ESC closes only the top modal (respecting dismissible and the dirty guard).
  useEffect(() => {
    if (!topId) return;
    const top = stack.at(-1);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (top?.options.dismissible === false) return;
      e.preventDefault();
      onRequestClose(topId);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [topId, stack, onRequestClose]);

  return createPortal(
    <AnimatePresence>
      {stack.map((entry, index) => (
        <ModalFrame
          key={entry.id}
          entry={entry}
          isTop={entry.id === topId}
          depth={index}
          onClose={onClose}
          onRequestClose={onRequestClose}
          onSetDirty={onSetDirty}
        />
      ))}
    </AnimatePresence>,
    document.body,
  );
}

function ModalFrame({
  entry,
  isTop,
  depth,
  onClose,
  onRequestClose,
  onSetDirty,
}: {
  entry: ModalEntry;
  isTop: boolean;
  depth: number;
  onClose: (id: string, result: unknown) => void;
  onRequestClose: (id: string) => void;
  onSetDirty: (id: string, dirty: boolean) => void;
}) {
  const { t } = useTranslation();
  const { id, options } = entry;
  const type = options.type ?? 'dialog';
  const size = options.size ?? 'md';
  const dismissible = options.dismissible !== false;
  const closeOnBackdrop = dismissible && options.closeOnBackdrop !== false;
  const reduce = useReducedMotion();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const api = useMemo<ModalApi>(
    () => ({
      id,
      close: (result?: unknown) => onClose(id, result),
      requestClose: () => onRequestClose(id),
      setDirty: (d: boolean) => onSetDirty(id, d),
    }),
    [id, onClose, onRequestClose, onSetDirty],
  );

  // Focus on open, restore focus to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const target =
      panel?.querySelector<HTMLElement>('[data-autofocus]') ??
      panel?.querySelector<HTMLElement>('input, select, textarea') ??
      panel;
    target?.focus({ preventScroll: true });
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  // Focus trap: Tab cycles within the top modal.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null || n === document.activeElement,
    );
    if (nodes.length === 0) {
      e.preventDefault();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  const content: ReactNode =
    typeof options.content === 'function' ? options.content(api) : options.content;

  const quick = { duration: reduce ? 0 : 0.18, ease: [0.2, 0, 0, 1] as const };
  const panelMotion =
    type === 'drawer'
      ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
      : {
          initial: { opacity: 0, scale: 0.97, y: 6 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.98, y: 4 },
        };

  return (
    <div
      className={cn(
        'fixed inset-0',
        type === 'drawer' ? 'flex justify-end' : 'flex items-center justify-center p-4',
      )}
      style={{ zIndex: 1300 + depth * 10 }}
      inert={!isTop}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-neutral-950/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: depth === 0 ? 1 : 0.6 }}
        exit={{ opacity: 0 }}
        transition={quick}
        onClick={() => closeOnBackdrop && onRequestClose(id)}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={options.description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        {...panelMotion}
        transition={quick}
        className={cn(
          'relative flex w-full flex-col bg-surface shadow-layer outline-none',
          type === 'drawer'
            ? cn('h-full border-l border-neutral-200', DRAWER_WIDTH[size])
            : cn(
                'max-h-[calc(100vh-2rem)] rounded-md border border-neutral-200',
                DIALOG_WIDTH[size],
              ),
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[17px] leading-snug font-semibold text-neutral-950">
              {options.title}
            </h2>
            {options.description && (
              <p id={descId} className="mt-1 text-[13px] text-neutral-600">
                {options.description}
              </p>
            )}
          </div>
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={t('common.actions.close')}
              icon={<LuX />}
              onClick={() => onRequestClose(id)}
              className="-mt-1 -mr-2"
            />
          )}
        </div>
        <CurrentModalContext.Provider value={api}>
          <div className="flex min-h-0 flex-1 flex-col">{content}</div>
        </CurrentModalContext.Provider>
      </motion.div>
    </div>
  );
}

/** Scrollable body + sticky footer layout for modal content. */
export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-5', className)}>{children}</div>
  );
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-5 py-3">
      {children}
    </div>
  );
}
