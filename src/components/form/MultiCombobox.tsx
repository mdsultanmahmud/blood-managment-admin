import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { LuCheck, LuChevronDown, LuX } from 'react-icons/lu';
import { cn } from '@/lib/cn';

export interface MultiComboboxProps<T> {
  options: readonly T[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (a: T, b: T) => boolean;
  getOptionDisabled?: (option: T) => boolean;
  renderOption?: (option: T) => ReactNode;
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
  /** Accessible names; override for translation. */
  openLabel?: string;
  closeLabel?: string;
  removeLabel?: (optionLabel: string) => string;
  label?: ReactNode;
  placeholder?: string;
  helperText?: ReactNode;
  error?: boolean;
  name?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Multi-select combobox: chosen options are chips, typing filters the list, the list stays open
 * while you pick, Backspace on empty text removes the last chip. No UI library.
 */
export function MultiCombobox<T>({
  options,
  value,
  onChange,
  getOptionLabel = String,
  isOptionEqualToValue = Object.is,
  getOptionDisabled,
  renderOption,
  loading = false,
  loadingText = 'Loading…',
  noOptionsText = 'No matches',
  openLabel = 'Open options',
  closeLabel = 'Close options',
  removeLabel = (l) => `Remove ${l}`,
  label,
  placeholder,
  helperText,
  error = false,
  name,
  id: idProp,
  inputRef,
  onBlur,
  disabled,
  className,
  style,
}: MultiComboboxProps<T>) {
  const auto = useId();
  const id = idProp ?? auto;
  const listId = `${id}-list`;
  const helpId = `${id}-help`;
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [active, setActive] = useState(-1);

  const isSelected = (o: T) => value.some((v) => isOptionEqualToValue(o, v));
  const shown = useMemo(() => {
    const q = text.trim().toLowerCase();
    return q ? options.filter((o) => getOptionLabel(o).toLowerCase().includes(q)) : options;
  }, [options, text, getOptionLabel]);

  const enabled = (i: number) => {
    const o = shown[i];
    return o !== undefined && !getOptionDisabled?.(o);
  };
  const step = (from: number, dir: 1 | -1) => {
    for (let n = 1; n <= shown.length; n++) {
      const i = (from + dir * n + shown.length * 2) % shown.length;
      if (enabled(i)) return i;
    }
    return -1;
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActive((a) => (a >= 0 && enabled(a) ? a : step(-1, 1)));
  };
  const close = () => {
    setOpen(false);
    setText('');
    setActive(-1);
  };
  const toggle = (i: number) => {
    const o = shown[i];
    if (o === undefined || !enabled(i)) return;
    onChange(isSelected(o) ? value.filter((v) => !isOptionEqualToValue(o, v)) : [...value, o]);
    setText('');
  };

  useEffect(() => {
    if (!open || active < 0) return;
    list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => step(a, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => step(a, -1));
        break;
      case 'Enter':
        if (open && active >= 0) {
          e.preventDefault();
          toggle(active);
        }
        break;
      case 'Backspace':
        if (text === '' && value.length > 0) onChange(value.slice(0, -1));
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        break;
      case 'Tab':
        close();
        break;
      default:
    }
  };

  const onRootBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (root.current?.contains(e.relatedTarget)) return;
    close();
    onBlur?.();
  };

  const activeId = open && active >= 0 ? `${id}-opt-${active}` : undefined;

  return (
    <div ref={root} className={cn('relative', className)} style={style} onBlur={onRootBlur}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1 rounded-sm border px-2 py-1 transition-colors',
          error ? 'border-danger-600' : 'border-neutral-300 hover:border-neutral-500',
          'focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600',
          error && 'focus-within:border-danger-600 focus-within:ring-danger-600',
          disabled ? 'bg-neutral-50 hover:border-neutral-300' : 'bg-surface',
        )}
      >
        {value.map((v, i) => {
          const chipLabel = getOptionLabel(v);
          return (
            <span
              key={i}
              className="inline-flex max-w-full items-center gap-1 rounded-sm bg-neutral-100 py-0.5 pr-0.5 pl-2 text-[13px] text-neutral-900"
            >
              <span className="truncate">{chipLabel}</span>
              {!disabled && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={removeLabel(chipLabel)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChange(value.filter((x) => !isOptionEqualToValue(x, v)))}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-200"
                >
                  <LuX aria-hidden />
                </button>
              )}
            </span>
          );
        })}
        <input
          id={id}
          name={name}
          ref={inputRef}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={error || undefined}
          aria-describedby={helperText ? helpId : undefined}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : undefined}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onMouseDown={() => {
            if (!open) openList();
          }}
          onKeyDown={onKeyDown}
          className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:text-neutral-500"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? closeLabel : openLabel}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (open ? close() : openList())}
          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
        >
          <LuChevronDown aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={typeof label === 'string' ? label : undefined}
          className="absolute top-full right-0 left-0 z-[1250] mt-1 max-h-60 overflow-auto rounded-md border border-neutral-200 bg-surface py-1 shadow-layer"
        >
          {loading ? (
            <li role="presentation" className="px-3 py-2 text-sm text-neutral-600">
              {loadingText}
            </li>
          ) : shown.length === 0 ? (
            <li role="presentation" className="px-3 py-2 text-sm text-neutral-600">
              {noOptionsText}
            </li>
          ) : (
            shown.map((o, i) => {
              const isDisabled = getOptionDisabled?.(o) ?? false;
              const selected = isSelected(o);
              return (
                <li
                  key={i}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={isDisabled || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggle(i)}
                  onMouseMove={() => {
                    if (!isDisabled && active !== i) setActive(i);
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-neutral-900',
                    active === i && 'bg-neutral-100',
                    isDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    {renderOption ? renderOption(o) : getOptionLabel(o)}
                  </span>
                  {selected && <LuCheck aria-hidden className="shrink-0 text-primary-700" />}
                </li>
              );
            })
          )}
        </ul>
      )}
      {helperText && (
        <p
          id={helpId}
          className={cn('mt-1 text-xs', error ? 'text-danger-700' : 'text-neutral-600')}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
