import { useTranslation } from 'react-i18next';
import { LuConstruction } from 'react-icons/lu';

/** Shown on every menu until its page is built. */
export function UnderConstructionPage({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <LuConstruction className="mx-auto text-3xl text-warning-600" aria-hidden />
        <p className="mt-3 text-xs font-medium tracking-wide text-warning-700 uppercase">
          {t('status.underConstruction.badge')}
        </p>
        <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.015em] text-neutral-950">
          {name}
        </h1>
        <p className="mt-2 text-[15px] text-neutral-600">{t('status.underConstruction.message')}</p>
      </div>
    </div>
  );
}
