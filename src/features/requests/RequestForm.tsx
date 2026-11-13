import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { bloodApi, URGENCIES, BLOOD_GROUPS, type BloodRequest } from '@/api/modules/blood';
import { FormAutocomplete } from '@/components/form/FormAutocomplete';
import { FormTextField } from '@/components/form/FormTextField';
import { ModalBody, ModalFooter } from '@/components/modal/ModalHost';
import { Button } from '@/components/ui/Button';
import { useCurrentModal, useDirtyGuard } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { bdPhoneField, nameField } from '@/lib/validation';
import { fromLocalInput, groupOptions, toLocalInput, urgencyOptions } from '../blood/labels';

// Mirrors backend requests.schemas.ts: 1 to 20 bags, a Bangladeshi attendant number.
const schema = z.object({
  patientName: nameField,
  hospital: z.string().trim().min(2, 'validation.hospital.required').max(160),
  district: z.string().trim().min(2, 'validation.district.required').max(60),
  bloodGroup: z.enum(BLOOD_GROUPS, 'validation.bloodGroup.required'),
  units: z.coerce
    .number('validation.units.invalid')
    .int('validation.units.invalid')
    .min(1, 'validation.units.invalid')
    .max(20, 'validation.units.invalid'),
  urgency: z.enum(URGENCIES, 'validation.urgency.required'),
  neededBy: z.string().min(1, 'validation.neededBy.required'),
  contactName: nameField,
  contactPhone: bdPhoneField,
  reason: z.string().trim().max(300),
});
type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

const initial = (r?: BloodRequest): Input => ({
  patientName: r?.patientName ?? '',
  hospital: r?.hospital ?? '',
  district: r?.district ?? '',
  bloodGroup: r?.bloodGroup ?? ('' as Input['bloodGroup']),
  units: r?.units ?? 1,
  urgency: r?.urgency ?? ('' as Input['urgency']),
  neededBy: r ? toLocalInput(r.neededBy) : '',
  contactName: r?.contactName ?? '',
  contactPhone: r?.contactPhone ?? '',
  reason: r?.reason ?? '',
});

/** Add or edit a blood request; `request` set means edit. */
export function RequestForm({ request }: { request?: BloodRequest }) {
  const { t } = useTranslation();
  const modal = useCurrentModal<BloodRequest>();
  const { control, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: initial(request),
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      ...v,
      neededBy: fromLocalInput(v.neededBy),
      reason: v.reason ? v.reason : null,
    };
    try {
      const saved = request
        ? await bloodApi.updateRequest(request.id, body)
        : await bloodApi.createRequest(body);
      notify.success(t(request ? 'requests.saved' : 'requests.added'));
      modal.close(saved);
    } catch (err) {
      notify.error(userMessage(err));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <ModalBody className="flex flex-col gap-4">
        <FormTextField
          control={control}
          name="patientName"
          label={t('blood.field.patientName')}
          autoFocus
          fullWidth
        />
        <FormTextField
          control={control}
          name="hospital"
          label={t('blood.field.hospital')}
          fullWidth
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="district"
            label={t('blood.field.district')}
            fullWidth
          />
          <FormAutocomplete
            control={control}
            name="bloodGroup"
            label={t('blood.field.bloodGroup')}
            options={groupOptions(t)}
          />
          <FormTextField
            control={control}
            name="units"
            type="number"
            label={t('blood.field.units')}
            helperText={t('requests.form.unitsHelp')}
            fullWidth
          />
          <FormAutocomplete
            control={control}
            name="urgency"
            label={t('blood.field.urgency')}
            options={urgencyOptions(t)}
          />
        </div>
        <FormTextField
          control={control}
          name="neededBy"
          type="datetime-local"
          label={t('blood.field.neededBy')}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="contactName"
            label={t('blood.field.contactName')}
            fullWidth
          />
          <FormTextField
            control={control}
            name="contactPhone"
            type="tel"
            label={t('blood.field.contactPhone')}
            helperText={t('blood.phoneHelp')}
            fullWidth
          />
        </div>
        <FormTextField
          control={control}
          name="reason"
          label={t('blood.field.reason')}
          multiline
          minRows={2}
          fullWidth
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t(request ? 'requests.form.save' : 'requests.form.add')}
        </Button>
      </ModalFooter>
    </form>
  );
}
