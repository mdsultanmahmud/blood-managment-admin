import i18n from 'i18next';
import type { ReactNode } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { tx } from '@/lib/translate';
import { Combobox } from './Combobox';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Single-select combobox storing the option's `value` in the form. */
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
        <Combobox<AutocompleteOption>
          options={options}
          loading={loading}
          loadingText={i18n.t('common.select.loading')}
          noOptionsText={noOptionsText ?? i18n.t('common.select.noMatches')}
          clearLabel={i18n.t('common.select.clear')}
          openLabel={i18n.t('common.select.open')}
          closeLabel={i18n.t('common.select.close')}
          value={options.find((o) => o.value === field.value) ?? null}
          onChange={(option) => field.onChange(option?.value ?? '')}
          onBlur={field.onBlur}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.value === b.value}
          getOptionDisabled={(o) => Boolean(o.disabled)}
          renderOption={(option) => (
            <div className="flex w-full items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-neutral-900">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-neutral-600">{option.description}</p>
                )}
              </div>
              {renderOptionExtra?.(option)}
            </div>
          )}
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
  );
}
