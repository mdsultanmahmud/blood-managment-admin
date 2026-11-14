import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { LuCheck, LuChevronDown } from 'react-icons/lu';
import { cn } from '@/lib/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
}

/**
 * Dropdown that picks several values from a short list (grid filters). The closed field shows the
 * chosen labels or `anyLabel`. Focus stays on the field; arrows move, Space or Enter toggles,
 * Escape closes. No UI library.
 */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  anyLabel,
  className,
  style,
}: {
  label: string;
  options: readonly MultiSelectOption[];
  value: readonly string[];
  onChange: (value: string[]) => void;
  /** Text of the closed field while nothing is chosen. */
  anyLabel: string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const labelOf = new Map(options.map((o) => [o.value, o.label]));
  const summary = value.length ? value.map((v) => labelOf.get(v) ?? v).join(', ') : anyLabel;

  const toggle = (i: number) => {
    const o = options[i];
    if (!o) return;
    onChange(value.includes(o.value) ? value.filter((v) => v !== o.value) : [...value, o.value]);
  };

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((a) => Math.min(a + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) setOpen(true);
        else toggle(active);
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
    }
  };

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!root.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div ref={root} className={cn('relative', className)} style={style} onBlur={onBlur}>
      <span id={`${id}-label`} className="mb-1 block text-[13px] font-medium text-neutral-700">
        {label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-value`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="flex h-10 w-full items-center rounded-sm border border-neutral-300 bg-surface px-3 text-left text-sm transition-colors hover:border-neutral-500 focus-visible:border-primary-600 focus-visible:ring-1 focus-visible:ring-primary-600 focus-visible:outline-none"
      >
        <span
          id={`${id}-value`}
          className={cn(
            'min-w-0 flex-1 truncate',
            value.length ? 'text-neutral-900' : 'text-neutral-600',
          )}
        >
          {summary}
        </span>
        <LuChevronDown
          aria-hidden
          className={cn('shrink-0 text-neutral-500 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={`${id}-label`}
          className="absolute top-full right-0 left-0 z-[1250] mt-1 max-h-60 min-w-40 overflow-auto rounded-md border border-neutral-200 bg-surface py-1 shadow-layer"
        >
          {options.map((o, i) => {
            const selected = value.includes(o.value);
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(i)}
                onMouseMove={() => setActive(i)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-neutral-900',
                  active === i && 'bg-neutral-100',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                    selected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-neutral-400',
                  )}
                >
                  {selected && <LuCheck className="text-[12px]" />}
                </span>
                <span className="min-w-0 flex-1">{o.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
