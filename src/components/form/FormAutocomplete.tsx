import i18n from 'i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { ReactNode } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { tx } from '@/lib/translate';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Single-select autocomplete storing the option's `value` in the form. */
export function FormAutocomplete<T extends FieldValues>({
  control,
  name,
  label,
  options,
  loading,
  helperText,
  noOptionsText,
  renderOptionExtra,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: AutocompleteOption[];
  loading?: boolean;
  helperText?: string;
  noOptionsText?: string;
  renderOptionExtra?: (o: AutocompleteOption) => ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete<AutocompleteOption>
          options={options}
          loading={loading}
          noOptionsText={noOptionsText ?? i18n.t('common.select.noMatches')}
          value={options.find((o) => o.value === field.value) ?? null}
          onChange={(_e, option) => field.onChange(option?.value ?? '')}
          onBlur={field.onBlur}
          isOptionEqualToValue={(a, b) => a.value === b.value}
          getOptionDisabled={(o) => Boolean(o.disabled)}
          renderOption={(props, option) => {
            const { key, ...rest } = props as typeof props & { key: string };
            return (
              <li key={key} {...rest}>
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-900">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-neutral-600">{option.description}</p>
                    )}
                  </div>
                  {renderOptionExtra?.(option)}
                </div>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name={field.name}
              inputRef={field.ref}
              label={label}
              error={Boolean(fieldState.error)}
              // Zod messages are i18n keys (src/lib/validation.ts).
              helperText={
                fieldState.error?.message
                  ? tx(fieldState.error.message, fieldState.error.message)
                  : helperText
              }
            />
          )}
        />
      )}
    />
  );
}
