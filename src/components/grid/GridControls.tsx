import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuSearch, LuX } from 'react-icons/lu';
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
      sx={{ maxWidth: 320 }}
      slotProps={{
        htmlInput: { 'aria-label': label },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LuSearch className="text-neutral-500" aria-hidden />
            </InputAdornment>
          ),
          endAdornment: text ? (
            <InputAdornment position="end">
              <button
                type="button"
                aria-label={t('common.grid.clearSearch')}
                onClick={() => setText('')}
                className="-mr-1 inline-flex h-6 w-6 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100"
              >
                <LuX aria-hidden />
              </button>
            </InputAdornment>
          ) : null,
        },
      }}
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
      sx={{ width }}
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
  const labelOf = new Map(options.map((o) => [o.value, o.label]));
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(e) => {
        const v = e.target.value as unknown;
        onChange(typeof v === 'string' ? v.split(',').filter(Boolean) : (v as string[]));
      }}
      sx={{ width }}
      slotProps={{
        select: {
          multiple: true,
          displayEmpty: true,
          renderValue: (sel) => {
            const list = sel as string[];
            return list.length
              ? list.map((v) => labelOf.get(v) ?? v).join(', ')
              : (anyLabel ?? t('common.grid.any'));
          },
        },
        inputLabel: { shrink: true },
      }}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
