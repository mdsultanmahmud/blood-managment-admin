import { useId } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Checkbox } from './Checkbox';

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
        <div className="flex items-start gap-2.5">
          <Checkbox
            id={id}
            name={field.name}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            inputRef={field.ref}
            aria-describedby={description ? `${id}-desc` : undefined}
            className="mt-0.5"
          />
          <label htmlFor={id} className="cursor-pointer text-sm">
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
