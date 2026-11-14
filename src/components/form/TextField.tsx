import {
  Children,
  isValidElement,
  useId,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { cn } from '@/lib/cn';

type NativeField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface TextFieldProps {
  id?: string;
  name?: string;
  /** Shown above the field and tied to it with `for`. */
  label?: ReactNode;
  /** Shown under the field; replaced by the error message by the form wrappers. */
  helperText?: ReactNode;
  error?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: ChangeEvent<NativeField>) => void;
  onBlur?: (e: FocusEvent<NativeField>) => void;
  onFocus?: (e: FocusEvent<NativeField>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  /** Render a native select; children are `MenuItem`s. */
  select?: boolean;
  /** Render a textarea with `minRows` rows. */
  multiline?: boolean;
  minRows?: number;
  /** Content inside the field, before or after the text (icons, buttons). */
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  inputRef?: Ref<NativeField>;
  /** Extra attributes for the native element (`aria-label`, `maxLength`, `min`, `max`, `className`...). */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** One option of a `TextField select`. Renders a native `<option>`. */
export function MenuItem({
  value,
  disabled,
  children,
}: {
  value: string | number;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}

const FIELD_TEXT =
  'w-full min-w-0 bg-transparent text-sm text-neutral-900 outline-none disabled:cursor-not-allowed disabled:text-neutral-500';

/**
 * Text input, textarea or native select with a label above, helper text below and an error
 * state. Styled with the theme tokens only; no UI library.
 */
export function TextField({
  id: idProp,
  label,
  helperText,
  error = false,
  select = false,
  multiline = false,
  minRows = 3,
  startAdornment,
  endAdornment,
  inputRef,
  inputProps,
  className,
  style,
  children,
  required,
  disabled,
  type,
  ...rest
}: TextFieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const helpId = `${id}-help`;
  const { className: inputClass, ...inputRest } = inputProps ?? {};
  const aria = {
    id,
    'aria-invalid': error || undefined,
    'aria-describedby': helperText ? helpId : undefined,
    disabled,
    required,
  };

  // A select whose value is empty and has no empty option shows a blank, like an unset field.
  const hasEmptyOption = Children.toArray(children).some(
    (c) => isValidElement<{ value?: unknown }>(c) && c.props.value === '',
  );

  const box = cn(
    'flex w-full rounded-sm border transition-colors',
    error ? 'border-danger-600' : 'border-neutral-300 hover:border-neutral-500',
    'focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600',
    error && 'focus-within:border-danger-600 focus-within:ring-danger-600',
    disabled ? 'bg-neutral-50 text-neutral-500 hover:border-neutral-300' : 'bg-surface',
    multiline ? 'items-start' : 'h-10 items-center',
  );

  return (
    <div className={className} style={style}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-neutral-700">
          {label}
          {required && (
            <span aria-hidden className="ml-0.5 text-danger-600">
              *
            </span>
          )}
        </label>
      )}
      <div className={box}>
        {startAdornment && (
          <span className="flex shrink-0 items-center pl-3">{startAdornment}</span>
        )}
        {select ? (
          <select
            {...aria}
            {...rest}
            ref={inputRef as Ref<HTMLSelectElement>}
            className={cn(FIELD_TEXT, 'h-full cursor-pointer appearance-none px-3', inputClass)}
          >
            {!hasEmptyOption && <option value="" disabled hidden />}
            {children}
          </select>
        ) : multiline ? (
          <textarea
            {...aria}
            {...rest}
            ref={inputRef as Ref<HTMLTextAreaElement>}
            rows={minRows}
            className={cn(FIELD_TEXT, 'resize-y px-3 py-2', inputClass)}
          />
        ) : (
          <input
            {...aria}
            {...inputRest}
            {...rest}
            ref={inputRef as Ref<HTMLInputElement>}
            type={type ?? 'text'}
            className={cn(FIELD_TEXT, 'h-full px-3 placeholder:text-neutral-400', inputClass)}
          />
        )}
        {select ? (
          <LuChevronDown
            aria-hidden
            className="pointer-events-none mr-3 shrink-0 text-neutral-500"
          />
        ) : (
          endAdornment && <span className="flex shrink-0 items-center pr-2">{endAdornment}</span>
        )}
      </div>
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
