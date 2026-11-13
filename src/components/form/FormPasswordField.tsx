import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { tx } from '@/lib/translate';

/** Password input with a show/hide toggle. */
export function FormPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  autoComplete = 'current-password',
  helperText,
  autoFocus,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  autoComplete?: 'current-password' | 'new-password';
  helperText?: string;
  autoFocus?: boolean;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          name={field.name}
          inputRef={field.ref}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          label={label}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          error={Boolean(fieldState.error)}
          helperText={
            fieldState.error?.message
              ? tx(fieldState.error.message, fieldState.error.message)
              : helperText
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? t('common.password.hide') : t('common.password.show')}
                    aria-pressed={visible}
                    className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                  >
                    {visible ? <LuEyeOff aria-hidden /> : <LuEye aria-hidden />}
                  </button>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
