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
import { LuChevronDown, LuX } from 'react-icons/lu';
import { cn } from '@/lib/cn';

export interface ComboboxProps<T> {
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (a: T, b: T) => boolean;
  getOptionDisabled?: (option: T) => boolean;
  /** Content of one list row; defaults to the option label. */
  renderOption?: (option: T) => ReactNode;
  /** Narrow the options for the typed text; defaults to a case-insensitive "label contains". */
  filterOptions?: (options: readonly T[], input: string) => readonly T[];
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
  /** Accessible names of the icon buttons; override for translation. */
  clearLabel?: string;
  openLabel?: string;
  closeLabel?: string;
  label?: ReactNode;
  placeholder?: string;
  helperText?: ReactNode;
  error?: boolean;
  /** Content inside the field before the text, for example the selected option's icon. */
  startAdornment?: ReactNode;
  name?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Single-select combobox: type to filter, arrows and Enter to choose, Escape to close
 * (WAI-ARIA combobox with a listbox popup). No UI library.
 */
export function Combobox<T>({
  options,
  value,
  onChange,
  getOptionLabel = String,
  isOptionEqualToValue = Object.is,
  getOptionDisabled,
  renderOption,
  filterOptions,
  loading = false,
  loadingText = 'Loading…',
  noOptionsText = 'No matches',
  clearLabel = 'Clear',
  openLabel = 'Open options',
  closeLabel = 'Close options',
  label,
  placeholder,
  helperText,
  error = false,
  startAdornment,
  name,
  id: idProp,
  inputRef,
  onBlur,
  disabled,
  className,
  style,
}: ComboboxProps<T>) {
  const auto = useId();
  const id = idProp ?? auto;
  const listId = `${id}-list`;
  const helpId = `${id}-help`;
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  /** What the user typed; null means "show the selected option's label". */
  const [typed, setTyped] = useState<string | null>(null);
  const [active, setActive] = useState(-1);

  const text = typed ?? (value === null ? '' : getOptionLabel(value));
  const shown = useMemo(() => {
    if (!typed) return options;
    if (filterOptions) return filterOptions(options, typed);
    const q = typed.trim().toLowerCase();
    return options.filter((o) => getOptionLabel(o).toLowerCase().includes(q));
  }, [options, typed, filterOptions, getOptionLabel]);

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
    const selected = value === null ? -1 : shown.findIndex((o) => isOptionEqualToValue(o, value));
    setActive(selected >= 0 && enabled(selected) ? selected : step(-1, 1));
  };
  const close = () => {
    setOpen(false);
    setTyped(null);
    setActive(-1);
  };
  const choose = (i: number) => {
    const o = shown[i];
    if (o === undefined || !enabled(i)) return;
    onChange(o);
    close();
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
      case 'Home':
        if (open) {
          e.preventDefault();
          setActive(step(-1, 1));
        }
        break;
      case 'End':
        if (open) {
          e.preventDefault();
          setActive(step(0, -1));
        }
        break;
      case 'Enter':
        if (open && active >= 0) {
          e.preventDefault();
          choose(active);
        }
        break;
      case 'Escape':
        if (open) {
          // Keep the Escape inside the field so an enclosing dialog stays open.
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

  const hasValue = value !== null && !disabled;
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
          'flex h-10 w-full items-center rounded-sm border transition-colors',
          error ? 'border-danger-600' : 'border-neutral-300 hover:border-neutral-500',
          'focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600',
          error && 'focus-within:border-danger-600 focus-within:ring-danger-600',
          disabled ? 'bg-neutral-50 hover:border-neutral-300' : 'bg-surface',
        )}
      >
        {startAdornment && (
          <span className="flex shrink-0 items-center pl-3">{startAdornment}</span>
        )}
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
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setTyped(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onMouseDown={() => {
            if (!open) openList();
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:text-neutral-500"
        />
        {hasValue && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={clearLabel}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(null);
              setTyped(null);
            }}
            className="mr-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100"
          >
            <LuX aria-hidden />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? closeLabel : openLabel}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (open ? close() : openList())}
          className="mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
        >
          <LuChevronDown aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
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
              const selected = value !== null && isOptionEqualToValue(o, value);
              return (
                <li
                  key={i}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={isDisabled || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  onMouseMove={() => {
                    if (!isDisabled && active !== i) setActive(i);
                  }}
                  className={cn(
                    'cursor-pointer px-3 py-1.5 text-sm text-neutral-900',
                    active === i && 'bg-neutral-100',
                    selected && 'font-medium text-primary-700',
                    isDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {renderOption ? renderOption(o) : getOptionLabel(o)}
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
