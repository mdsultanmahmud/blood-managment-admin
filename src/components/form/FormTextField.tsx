import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { tx } from '@/lib/translate';
import { TextField, type TextFieldProps } from './TextField';

export type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

/** TextField bound to react-hook-form; shows the field error, else the helper text. */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  helperText,
  ...rest
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          name={field.name}
          inputRef={field.ref}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
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
