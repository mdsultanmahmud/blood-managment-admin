import { useTranslation } from 'react-i18next';

/** Who built the panel; the same credit appears in BC's footer. */
const DEVELOPER = {
  name: 'Iftekhar Md Shishir',
  url: 'https://www.linkedin.com/in/iftekhar-md-shishir/',
};

/** LinkedIn's mark in its own blue (react-icons has no colour). */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

/**
 * The thin bar pinned to the bottom of the shell (like the top bar to the top): the copyright
 * year on the left, the developer credit linking to LinkedIn in a new tab on the right.
 */
export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="sticky bottom-0 z-[1000] flex h-8 shrink-0 items-center justify-between gap-4 border-t border-neutral-200 bg-surface/95 px-4 text-xs text-neutral-500 backdrop-blur-sm lg:px-8">
      <span className="min-w-0 truncate">
        {t('shell.footer.copyright', { year: new Date().getFullYear() })}
      </span>
      <a
        href={DEVELOPER.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('shell.footer.linkLabel', { name: DEVELOPER.name })}
        className="group inline-flex shrink-0 items-center gap-1.5 rounded-sm whitespace-nowrap outline-offset-2 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600"
      >
        {t('shell.footer.developedBy')}{' '}
        <span className="font-medium text-neutral-700 underline-offset-2 group-hover:text-primary-700 group-hover:underline">
          {DEVELOPER.name}
        </span>
        <LinkedInMark />
      </a>
    </footer>
  );
}
