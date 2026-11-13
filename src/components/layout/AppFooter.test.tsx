import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppFooter } from './AppFooter';

describe('AppFooter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows only the copyright and the current year on the left', () => {
    vi.useFakeTimers({ now: new Date('2027-03-01T10:00:00Z'), toFake: ['Date'] });
    render(<AppFooter />);
    // Exact text: nothing after the year, not even a space left by a missing name.
    expect(screen.getByText('© 2027').textContent).toBe('© 2027');
  });

  it('credits the developer with a LinkedIn link that opens in a new tab', () => {
    render(<AppFooter />);
    const link = screen.getByRole('link', {
      name: 'Developed by Iftekhar Md Shishir on LinkedIn (opens in a new tab)',
    });
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/iftekhar-md-shishir/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('Developed by Iftekhar Md Shishir');
  });

  it('is a contentinfo landmark pinned to the bottom', () => {
    render(<AppFooter />);
    expect(screen.getByRole('contentinfo')).toHaveClass('sticky', 'bottom-0');
  });
});
