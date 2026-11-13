import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toApiError } from '@/api/errors';
import { staffApi, type Staff } from '@/api/modules/staff';
import { FormMultiAutocomplete } from '@/components/form/FormMultiAutocomplete';
import { FormPasswordField } from '@/components/form/FormPasswordField';
import { FormTextField } from '@/components/form/FormTextField';
import { ModalBody, ModalFooter } from '@/components/modal/ModalHost';
import { Button } from '@/components/ui/Button';
import { useCurrentModal, useDirtyGuard } from '@/context/modalTypes';
import { userMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { emailField, nameField, newPasswordField, roleIdsField } from '@/lib/validation';
import { useRoleOptions } from './useRoleOptions';

const editSchema = z.object({ name: nameField, email: emailField, roleIds: roleIdsField });
const addSchema = editSchema.extend({ password: newPasswordField });
type EditValues = z.infer<typeof editSchema>;
type AddValues = z.infer<typeof addSchema>;

function failEmail(err: unknown, setEmailError: () => void): void {
  if (toApiError(err).code === 'COMPANY_USER_EMAIL_TAKEN') setEmailError();
  else notify.error(userMessage(err));
}

export function AddStaffForm() {
  const { t } = useTranslation();
  const modal = useCurrentModal<Staff>();
  const roles = useRoleOptions();
  const { control, handleSubmit, setError, formState } = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { name: '', email: '', password: '', roleIds: [] },
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const saved = await staffApi.create(v);
      notify.success(t('staff.added'));
      modal.close(saved);
    } catch (err) {
      failEmail(err, () => setError('email', { message: 'errors.COMPANY_USER_EMAIL_TAKEN' }));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <ModalBody className="flex flex-col gap-4">
        <FormTextField control={control} name="name" label={t('staff.form.name')} autoFocus />
        <FormTextField
          control={control}
          name="email"
          type="email"
          autoComplete="off"
          label={t('staff.form.email')}
        />
        <FormPasswordField
          control={control}
          name="password"
          label={t('staff.form.password')}
          autoComplete="new-password"
          helperText={t('staff.form.passwordRule')}
        />
        <FormMultiAutocomplete
          control={control}
          name="roleIds"
          label={t('staff.form.roles')}
          options={roles.options}
          loading={roles.loading}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t('staff.form.add')}
        </Button>
      </ModalFooter>
    </form>
  );
}

export function EditStaffForm({ staff }: { staff: Staff }) {
  const { t } = useTranslation();
  const modal = useCurrentModal<Staff>();
  const roles = useRoleOptions();
  const { control, handleSubmit, setError, formState } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: staff.name, email: staff.email, roleIds: staff.roles.map((r) => r.id) },
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const saved = await staffApi.update(staff.id, v);
      notify.success(t('staff.saved'));
      modal.close(saved);
    } catch (err) {
      failEmail(err, () => setError('email', { message: 'errors.COMPANY_USER_EMAIL_TAKEN' }));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <ModalBody className="flex flex-col gap-4">
        <FormTextField control={control} name="name" label={t('staff.form.name')} autoFocus />
        <FormTextField
          control={control}
          name="email"
          type="email"
          autoComplete="off"
          label={t('staff.form.email')}
        />
        <FormMultiAutocomplete
          control={control}
          name="roleIds"
          label={t('staff.form.roles')}
          options={roles.options}
          loading={roles.loading}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t('staff.form.save')}
        </Button>
      </ModalFooter>
    </form>
  );
}

const passwordSchema = z.object({ password: newPasswordField });

export function SetPasswordForm({ staff }: { staff: Staff }) {
  const { t } = useTranslation();
  const modal = useCurrentModal();
  const { control, handleSubmit, formState } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });
  useDirtyGuard(formState.isDirty);

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      await staffApi.setPassword(staff.id, password);
      notify.success(t('staff.passwordSet'));
      modal.close();
    } catch (err) {
      notify.error(userMessage(err));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <ModalBody className="flex flex-col gap-3">
        <p className="text-sm text-neutral-600">{t('staff.form.passwordHelp')}</p>
        <FormPasswordField
          control={control}
          name="password"
          label={t('staff.form.password')}
          autoComplete="new-password"
          helperText={t('staff.form.passwordRule')}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => modal.requestClose()}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={formState.isSubmitting}>
          {t('staff.form.setPassword')}
        </Button>
      </ModalFooter>
    </form>
  );
}
