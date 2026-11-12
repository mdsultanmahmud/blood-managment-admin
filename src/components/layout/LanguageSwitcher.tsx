import { useTranslation } from 'react-i18next';
import { LuLanguages } from 'react-icons/lu';
import { useReadySite } from '@/context/siteState';
import { chooseLanguage } from '@/i18n/language';
import { tx } from '@/lib/translate';
import { Menu } from '../ui/Menu';

/** Hidden while the site offers one language (ADR 0022). */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const site = useReadySite();
  if (site.languages.length < 2) return null;
  return (
    <Menu
      label={t('shell.language.label')}
      items={site.languages.map((code) => ({
        key: code,
        label: tx(`lang.${code}`, code),
        onSelect: () => void chooseLanguage(code),
      }))}
      trigger={({ open, id }) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          aria-label={t('shell.language.label')}
          className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          <LuLanguages aria-hidden />
          <span>{tx(`lang.${i18n.language}`, i18n.language)}</span>
        </button>
      )}
    />
  );
}
