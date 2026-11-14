import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { bloodApi, type BloodBank } from '@/api/modules/blood';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormTextField } from '@/components/form/FormTextField';
import { ModalBody, ModalFooter } from '@/components/modal/ModalHost';
import { Button } from '@/components/ui/Button';
import { useCurrentModal, useDirtyGuard } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { normalizeBdPhone } from '@/lib/validation';

// Mirrors backend banks.schemas.ts; the phone is optional.
const schema = z.object({
  name: z.string().trim().min(2, 'validation.name.tooShort').max(160),
  district: z.string().trim().min(2, 'validation.district.required').max(60),
  address: z.string().trim().min(3, 'validation.address.required').max(300),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || normalizeBdPhone(v) !== null, 'validation.phone.invalid'),
  notes: z.string().trim().max(500),
  isActive: z.boolean(),
});
type Input = z.infer<typeof schema>;

const initial = (b?: BloodBank): Input => ({
  name: b?.name ?? '',
  district: b?.district ?? '',
  address: b?.address ?? '',
  phone: b?.phone ?? '',
  notes: b?.notes ?? '',
  isActive: b?.isActive ?? true,
});

/** Add or edit a blood bank; `bank` set means edit. */
export function BankForm({ bank }: { bank?: BloodBank }) {
  const { t } = useTranslation();
  const modal = useCurrentModal<BloodBank>();
  const { control, handleSubmit, formState } = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: initial(bank),
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      ...v,
      phone: v.phone ? normalizeBdPhone(v.phone) : null,
      notes: v.notes ? v.notes : null,
    };
    try {
      const saved = bank
        ? await bloodApi.updateBank(bank.id, body)
        : await bloodApi.createBank(body);
      notify.success(t(bank ? 'banks.saved' : 'banks.added', { name: saved.name }));
      modal.close(saved);
    } catch (err) {
      notify.error(userMessage(err));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <ModalBody className="flex flex-col gap-4">
        <FormTextField control={control} name="name" label={t('blood.field.name')} autoFocus />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormTextField control={control} name="district" label={t('blood.field.district')} />
          <FormTextField
            control={control}
            name="phone"
            type="tel"
            label={t('blood.field.phoneOptional')}
            helperText={t('blood.phoneHelp')}
          />
        </div>
        <FormTextField control={control} name="address" label={t('blood.field.address')} />
        <FormTextField
          control={control}
          name="notes"
          label={t('blood.field.notes')}
          multiline
          minRows={2}
        />
        <FormCheckbox
          control={control}
          name="isActive"
          label={t('blood.field.isActive')}
          description={t('banks.form.activeHelp')}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t(bank ? 'banks.form.save' : 'banks.form.add')}
        </Button>
      </ModalFooter>
    </form>
  );
}
