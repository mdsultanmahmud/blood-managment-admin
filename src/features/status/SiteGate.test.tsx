import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { siteApi } from '@/api/modules/site';
import { SiteProvider } from '@/context/SiteContext';
import { createQueryClient } from '@/lib/queryClient';
import { SITE } from '@/test/fixtures';
import { SiteGate } from './SiteGate';

vi.mock('@/api/modules/site', () => ({ siteApi: { get: vi.fn() } }));

function renderGate() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <SiteProvider>
        <SiteGate>
          <p>inside</p>
        </SiteGate>
      </SiteProvider>
    </QueryClientProvider>,
  );
}

describe('SiteGate', () => {
  beforeEach(() => {
    vi.mocked(siteApi.get).mockReset();
  });

  it('shows the not-configured page when no company uses this address', async () => {
    vi.mocked(siteApi.get).mockRejectedValue(new ApiError(404, 'SITE_NOT_FOUND', 'x'));
    renderGate();
    expect(
      await screen.findByRole('heading', { name: 'This admin panel is not configured' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('inside')).not.toBeInTheDocument();
  });

  it('renders the panel and names the tab after the company and app', async () => {
    vi.mocked(siteApi.get).mockResolvedValue(SITE);
    renderGate();
    expect(await screen.findByText('inside')).toBeInTheDocument();
    expect(document.title).toBe('Club 71 · Social Club Management');
  });
});
