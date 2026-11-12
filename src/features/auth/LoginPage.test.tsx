import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { AuthContext } from '@/context/authState';
import { SiteContext } from '@/context/siteState';
import { fakeAuth, readySite } from '@/test/fixtures';
import LoginPage from './LoginPage';

function renderLogin(login: (email: string, password: string) => Promise<void>) {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <SiteContext.Provider value={readySite()}>
        <AuthContext.Provider
          value={fakeAuth({ status: 'anonymous', isAuthenticated: false, me: null, login })}
        >
          <LoginPage />
        </AuthContext.Provider>
      </SiteContext.Provider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('shows the company and translated validation messages', async () => {
    renderLogin(vi.fn());
    expect(screen.getByText('Club 71')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter an email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
  });

  it('shows the translated INVALID_CREDENTIALS message', async () => {
    const login = vi
      .fn()
      .mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    renderLogin(login);
    await userEvent.type(screen.getByLabelText('Email'), 'admin@roktolife.test');
    await userEvent.type(screen.getByLabelText('Password'), 'whatever-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
    expect(login).toHaveBeenCalledWith('admin@roktolife.test', 'whatever-password');
  });
});
