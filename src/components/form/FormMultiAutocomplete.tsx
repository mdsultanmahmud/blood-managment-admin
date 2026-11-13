import i18n from 'i18next';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { tx } from '@/lib/translate';
import type { AutocompleteOption } from './FormAutocomplete';
import { MultiCombobox } from './MultiCombobox';

/** Multi-select combobox storing the options' `value`s (a `string[]`) in the form. */
export function FormMultiAutocomplete<T extends FieldValues>({
  control,
  name,
  label,
  options,
  loading,
  helperText,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: AutocompleteOption[];
  loading?: boolean;
  helperText?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const values = new Set<string>(Array.isArray(field.value) ? (field.value as string[]) : []);
        return (
          <MultiCombobox<AutocompleteOption>
            options={options}
            loading={loading}
            loadingText={i18n.t('common.select.loading')}
            noOptionsText={i18n.t('common.select.noMatches')}
            openLabel={i18n.t('common.select.open')}
            closeLabel={i18n.t('common.select.close')}
            removeLabel={(l) => i18n.t('common.select.remove', { name: l })}
            value={options.filter((o) => values.has(o.value))}
            onChange={(picked) => field.onChange(picked.map((o) => o.value))}
            onBlur={field.onBlur}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.value === b.value}
            getOptionDisabled={(o) => Boolean(o.disabled)}
            renderOption={(option) => (
              <div className="min-w-0">
                <p className="text-sm text-neutral-900">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-neutral-600">{option.description}</p>
                )}
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
        );
      }}
    />
  );
}
