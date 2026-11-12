import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuColumns3 } from 'react-icons/lu';
import { Button } from '../ui/Button';

/** "Columns" popover: show/hide columns; the grid persists the choice per user. */
export function ColumnsMenu({
  columns,
  hidden,
  onToggle,
  onReset,
}: {
  columns: { colId: string; label: string }[];
  hidden: ReadonlySet<string>;
  onToggle: (colId: string, visible: boolean) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant="ghost"
        icon={<LuColumns3 />}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {t('common.grid.columns')}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="group"
            aria-label={t('common.grid.visibleColumns')}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.12 }}
            className="absolute top-full right-0 z-[1250] mt-1.5 w-56 rounded-md border border-neutral-200 bg-surface py-1.5 shadow-layer"
          >
            {columns.map((c) => (
              <label
                key={c.colId}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={!hidden.has(c.colId)}
                  onChange={(e) => onToggle(c.colId, e.target.checked)}
                  className="h-4 w-4 accent-primary-600"
                />
                {c.label}
              </label>
            ))}
            <div className="mt-1 border-t border-neutral-200 px-3 pt-1.5">
              <button
                type="button"
                onClick={onReset}
                className="text-[13px] font-medium text-primary-700 hover:underline"
              >
                {t('common.grid.resetLayout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
