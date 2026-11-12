import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<K extends string> {
  key: K;
  label: ReactNode;
  count?: number;
}

/** WAI-ARIA tabs: arrow keys move between tabs, the panel is labelled by its tab. */
export function Tabs<K extends string>({
  items,
  value,
  onChange,
  children,
  label,
}: {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  children: ReactNode;
  label: string;
}) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + items.length) % items.length;
    const item = items[next];
    if (item) {
      onChange(item.key);
      refs.current[next]?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 border-b border-neutral-200">
        {items.map((item, i) => {
          const selected = item.key === value;
          return (
            <button
              key={item.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-tab-${item.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${base}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                '-mb-px inline-flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary-600 text-primary-800'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900',
              )}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="rounded-sm bg-neutral-100 px-1.5 text-xs text-neutral-600 tabular-nums">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${value}`}
        className="pt-5"
      >
        {children}
      </div>
    </div>
  );
}
