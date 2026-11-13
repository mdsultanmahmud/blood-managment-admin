import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toApiError } from '@/api/errors';
import { bloodApi, BLOOD_GROUPS, DONOR_STATUSES, type Donor } from '@/api/modules/blood';
import { FormAutocomplete } from '@/components/form/FormAutocomplete';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormTextField } from '@/components/form/FormTextField';
import { ModalBody, ModalFooter } from '@/components/modal/ModalHost';
import { Button } from '@/components/ui/Button';
import { useCurrentModal, useDirtyGuard } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { bdPhoneField, nameField } from '@/lib/validation';
import { DONOR_STATUS_KEY, groupOptions } from '../blood/labels';

// Mirrors backend donors.schemas.ts.
const schema = z.object({
  fullName: nameField,
  phone: bdPhoneField,
  bloodGroup: z.enum(BLOOD_GROUPS, 'validation.bloodGroup.required'),
  district: z.string().trim().min(2, 'validation.district.required').max(60),
  lastDonatedOn: z.string(),
  isAvailable: z.boolean(),
  status: z.enum(DONOR_STATUSES),
  notes: z.string().trim().max(1000),
});
type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

const initial = (d?: Donor): Input => ({
  fullName: d?.fullName ?? '',
  phone: d?.phone ?? '',
  bloodGroup: d?.bloodGroup ?? ('' as Input['bloodGroup']),
  district: d?.district ?? '',
  lastDonatedOn: d?.lastDonatedOn ?? '',
  isAvailable: d?.isAvailable ?? true,
  status: d?.status ?? 'VERIFIED',
  notes: d?.notes ?? '',
});

/** Add or edit a donor; `donor` set means edit. */
export function DonorForm({ donor }: { donor?: Donor }) {
  const { t } = useTranslation();
  const modal = useCurrentModal<Donor>();
  const { control, handleSubmit, setError, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: initial(donor),
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      ...v,
      lastDonatedOn: v.lastDonatedOn ? v.lastDonatedOn : null,
      notes: v.notes ? v.notes : null,
    };
    try {
      const saved = donor
        ? await bloodApi.updateDonor(donor.id, body)
        : await bloodApi.createDonor(body);
      notify.success(t(donor ? 'donors.saved' : 'donors.added', { name: saved.fullName }));
      modal.close(saved);
    } catch (err) {
      if (toApiError(err).code === 'DONOR_PHONE_TAKEN')
        setError('phone', { message: 'errors.DONOR_PHONE_TAKEN' });
      else notify.error(userMessage(err));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <ModalBody className="flex flex-col gap-4">
        <FormTextField
          control={control}
          name="fullName"
          label={t('blood.field.fullName')}
          autoFocus
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="phone"
            type="tel"
            label={t('blood.field.phone')}
            helperText={t('blood.phoneHelp')}
          />
          <FormAutocomplete
            control={control}
            name="bloodGroup"
            label={t('blood.field.bloodGroup')}
            options={groupOptions(t)}
          />
          <FormTextField control={control} name="district" label={t('blood.field.district')} />
          <FormTextField
            control={control}
            name="lastDonatedOn"
            type="date"
            label={t('blood.field.lastDonatedOn')}
            helperText={t('donors.form.neverDonatedHelp')}
          />
        </div>
        <FormAutocomplete
          control={control}
          name="status"
          label={t('blood.field.status')}
          options={DONOR_STATUSES.map((s) => ({ value: s, label: t(DONOR_STATUS_KEY[s]) }))}
          helperText={t('donors.form.statusHelp')}
        />
        <FormCheckbox
          control={control}
          name="isAvailable"
          label={t('blood.field.isAvailable')}
          description={t('donors.form.availableHelp')}
        />
        <FormTextField
          control={control}
          name="notes"
          label={t('blood.field.notes')}
          multiline
          minRows={2}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t(donor ? 'donors.form.save' : 'donors.form.add')}
        </Button>
      </ModalFooter>
    </form>
  );
}
