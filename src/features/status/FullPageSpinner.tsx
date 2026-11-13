import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/Spinner';

export function FullPageSpinner({ label }: { label?: string }) {
  const { t } = useTranslation();
  const text = label ?? t('common.loading');
  return (
    <div className="flex min-h-screen items-center justify-center gap-2.5 bg-canvas text-sm text-neutral-600">
      <Spinner label={text} />
      <span aria-hidden>{text}</span>
    </div>
  );
}
