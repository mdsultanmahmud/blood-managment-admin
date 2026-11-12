import i18n from 'i18next';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { tx } from '@/lib/translate';
import type { AutocompleteOption } from './FormAutocomplete';

/** Multi-select autocomplete storing the options' `value`s (a `string[]`) in the form. */
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
          <Autocomplete<AutocompleteOption, true>
            multiple
            options={options}
            loading={loading}
            disableCloseOnSelect
            noOptionsText={i18n.t('common.select.noMatches')}
            value={options.filter((o) => values.has(o.value))}
            onChange={(_e, picked) => field.onChange(picked.map((o) => o.value))}
            onBlur={field.onBlur}
            isOptionEqualToValue={(a, b) => a.value === b.value}
            getOptionDisabled={(o) => Boolean(o.disabled)}
            renderValue={(picked, getItemProps) =>
              picked.map((o, index) => {
                const { key, ...rest } = getItemProps({ index });
                return <Chip key={key} {...rest} size="small" label={o.label} />;
              })
            }
            renderOption={(props, option) => {
              const { key, ...rest } = props as typeof props & { key: string };
              return (
                <li key={key} {...rest}>
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-900">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-neutral-600">{option.description}</p>
                    )}
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
        );
      }}
    />
  );
}
