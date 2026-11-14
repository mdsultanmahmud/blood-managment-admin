import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { bloodApi, type StockRow } from '@/api/modules/blood';
import { FormTextField } from '@/components/form/FormTextField';
import { ModalBody, ModalFooter } from '@/components/modal/ModalHost';
import { Button } from '@/components/ui/Button';
import { useCurrentModal, useDirtyGuard } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { GROUP_KEY } from '../blood/labels';

// Mirrors backend stock.schemas.ts: whole bags, 0 to 100,000.
const units = z.coerce
  .number('validation.stock.invalid')
  .int('validation.stock.invalid')
  .min(0, 'validation.stock.invalid')
  .max(100_000, 'validation.stock.invalid');
const schema = z.object({ unitsAvailable: units, unitsTarget: units });
type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

/** Set the bags in stock and the target for one blood group. */
export function StockForm({ row }: { row: StockRow }) {
  const { t } = useTranslation();
  const modal = useCurrentModal<StockRow>();
  const { control, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { unitsAvailable: row.unitsAvailable, unitsTarget: row.unitsTarget },
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const saved = await bloodApi.saveStock(row.bloodGroup, v);
      notify.success(t('stock.saved', { group: t(GROUP_KEY[row.bloodGroup]) }));
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
          name="unitsAvailable"
          type="number"
          label={t('stock.form.available')}
          autoFocus
        />
        <FormTextField
          control={control}
          name="unitsTarget"
          type="number"
          label={t('stock.form.target')}
          helperText={t('stock.form.targetHelp')}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t('stock.form.save')}
        </Button>
      </ModalFooter>
    </form>
  );
}
