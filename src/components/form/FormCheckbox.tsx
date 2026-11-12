import Checkbox from '@mui/material/Checkbox';
import { useId } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  description,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-start gap-1.5">
          <Checkbox
            name={field.name}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            slotProps={{
              input: {
                id,
                ref: field.ref,
                'aria-describedby': description ? `${id}-desc` : undefined,
              },
            }}
          />
          <label htmlFor={id} className="cursor-pointer pt-[5px] text-sm">
            <span className="text-neutral-900">{label}</span>
            {description && (
              <span id={`${id}-desc`} className="block text-[13px] text-neutral-600">
                {description}
              </span>
            )}
          </label>
        </div>
      )}
    />
  );
}
