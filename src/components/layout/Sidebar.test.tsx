import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SidebarProvider } from '@/context/SidebarContext';
import { SiteContext } from '@/context/siteState';
import { NAV, readySite } from '@/test/fixtures';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    // Desktop layout: the sidebar is always rendered.
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
    );
  });

  it('renders the company and every level of the navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SiteContext.Provider value={readySite()}>
          <SidebarProvider>
            <Sidebar items={NAV} />
          </SidebarProvider>
        </SiteContext.Provider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Club 71')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'L-dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'L-codes' })).toHaveAttribute('href', '/admin/codes');
    expect(screen.getByRole('button', { name: /L-languages/ })).toBeInTheDocument();
  });
});
