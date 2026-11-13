import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { FormPasswordField } from '@/components/form/FormPasswordField';
import { FormTextField } from '@/components/form/FormTextField';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/authState';
import { useReadySite } from '@/context/siteState';
import { userMessage } from '@/lib/errors';
import { AuthLayout } from './AuthLayout';
import { safeNext } from './safeNext';
import { loginSchema, type LoginValues } from './schemas';

export default function LoginPage() {
  const { t } = useTranslation();
  const site = useReadySite();
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  if (status === 'authenticated') return <Navigate to={next} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      void navigate(next, { replace: true });
    } catch (err) {
      setFormError(userMessage(err));
    }
  });

  return (
    <AuthLayout
      title={t('auth.login.title')}
      description={t('auth.login.description', { app: site.app.name })}
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        {formError && (
          <div
            role="alert"
            className="rounded-sm border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-800"
          >
            {formError}
          </div>
        )}
        <FormTextField
          control={control}
          name="email"
          label={t('auth.login.email')}
          type="email"
          autoComplete="username"
          autoFocus
        />
        <FormPasswordField
          control={control}
          name="password"
          label={t('auth.login.password')}
          autoComplete="current-password"
        />
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
          {t('auth.login.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
