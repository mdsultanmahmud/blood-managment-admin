import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteContext } from '@/context/siteState';
import { readySite, SITE } from '@/test/fixtures';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('is hidden while the site has one language', () => {
    const { container } = render(
      <SiteContext.Provider value={readySite()}>
        <LanguageSwitcher />
      </SiteContext.Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('appears when the site offers more languages', () => {
    render(
      <SiteContext.Provider value={readySite({ ...SITE, languages: ['en', 'bn'] })}>
        <LanguageSwitcher />
      </SiteContext.Provider>,
    );
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument();
  });
});
