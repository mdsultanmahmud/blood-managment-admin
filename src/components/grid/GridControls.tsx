import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuSearch, LuX } from 'react-icons/lu';
import { MenuItem, TextField } from '@/components/form/TextField';
import { MultiSelect } from '@/components/form/MultiSelect';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

/** Search box above a grid: local state, debounced before it reaches the URL/query. */
export function GridSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (q: string) => void;
  placeholder: string;
  label: string;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text.trim(), 300);

  // Follow external resets (e.g. "Clear filters").
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== debounced) setText(value);
  }

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <TextField
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-80"
      inputProps={{ 'aria-label': label }}
      startAdornment={<LuSearch className="text-neutral-500" aria-hidden />}
      endAdornment={
        text ? (
          <button
            type="button"
            aria-label={t('common.grid.clearSearch')}
            onClick={() => setText('')}
            className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100"
          >
            <LuX aria-hidden />
          </button>
        ) : null
      }
    />
  );
}

/** Small filter select for grid toolbars; '' means "any". */
export function GridFilterSelect({
  label,
  value,
  onChange,
  options,
  anyLabel,
  width = 170,
}: {
  label: string;
  value: string;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  anyLabel?: string;
  width?: number;
}) {
  const { t } = useTranslation();
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value || null)}
      style={{ width }}
    >
      <MenuItem value="">{anyLabel ?? t('common.grid.any')}</MenuItem>
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

/** Multi-value filter for grid toolbars; [] means "any". */
export function GridFilterMulti({
  label,
  value,
  onChange,
  options,
  anyLabel,
  width = 190,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
  anyLabel?: string;
  width?: number;
}) {
  const { t } = useTranslation();
  return (
    <MultiSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      anyLabel={anyLabel ?? t('common.grid.any')}
      style={{ width }}
    />
  );
}
