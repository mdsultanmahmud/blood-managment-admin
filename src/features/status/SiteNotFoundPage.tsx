import { useTranslation } from 'react-i18next';
import { LuGlobe } from 'react-icons/lu';

/** No company uses this address as its admin URL: no login form is shown. */
export function SiteNotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="max-w-md">
        <LuGlobe className="text-2xl text-neutral-500" aria-hidden />
        <h1 className="mt-3 text-[26px] leading-tight font-semibold tracking-[-0.015em] text-neutral-950">
          {t('status.siteNotFound.title')}
        </h1>
        <p className="mt-2 text-[15px] text-neutral-600">
          {t('status.siteNotFound.message', { origin: window.location.origin })}
        </p>
      </div>
    </main>
  );
}
