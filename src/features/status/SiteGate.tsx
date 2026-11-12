import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/States';
import { useSite } from '@/context/siteState';
import { userMessage } from '@/lib/errors';
import { FullPageSpinner } from './FullPageSpinner';
import { SiteNotFoundPage } from './SiteNotFoundPage';

/** Renders the panel only once the site behind this admin URL is known. */
export function SiteGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { status, error, retry } = useSite();
  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'not-found') return <SiteNotFoundPage />;
  if (status === 'error') {
    return (
      <main className="min-h-screen bg-canvas">
        <ErrorState
          title={t('status.siteError.title')}
          message={userMessage(error)}
          onRetry={retry}
        />
      </main>
    );
  }
  return children;
}
