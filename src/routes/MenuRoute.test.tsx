import { render, screen } from '@testing-library/react';
import { lazy } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { AppRoute, NavNode } from '@/api/schemas';
import { AuthContext } from '@/context/authState';
import { fakeAuth } from '@/test/fixtures';
import { MenuRoute } from './MenuRoute';
import type { PageRegistry } from './pages';

const nav: NavNode[] = [
  {
    key: 'blood_bank',
    label: 'Blood Bank',
    icon: null,
    path: null,
    children: [
      {
        key: 'blood_donars',
        label: 'Blood Donars',
        icon: null,
        path: '/blood/donars',
        children: [],
      },
    ],
  },
];

const donorsRoute = { key: 'blood_donars', path: '/blood/donars' };

function renderAt(
  path: string,
  opts: { pages?: PageRegistry; navigation?: NavNode[]; routes?: AppRoute[] } = {},
) {
  const auth = fakeAuth({
    navigation: opts.navigation ?? nav,
    routes: opts.routes ?? [donorsRoute],
  });
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={<MenuRoute pages={opts.pages ?? {}} />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('MenuRoute', () => {
  it('shows Under Construction for a menu without a page', () => {
    renderAt('/blood/donars');
    expect(screen.getByRole('heading', { name: 'Blood Donars' })).toBeInTheDocument();
    expect(screen.getByText('Under construction')).toBeInTheDocument();
  });

  it('shows the 404 page for a path that is not in the navigation', () => {
    renderAt('/admin/languages');
    expect(screen.getByRole('heading', { name: 'This page does not exist' })).toBeInTheDocument();
  });

  it('renders a registered page', async () => {
    const pages: PageRegistry = {
      blood_donars: lazy(() => Promise.resolve({ default: () => <p>Donors page</p> })),
    };
    renderAt('/blood/donars', { pages });
    expect(await screen.findByText('Donors page')).toBeInTheDocument();
  });

  it('sends / to the first menu when the dashboard is not available', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Blood Donars' })).toBeInTheDocument();
  });

  it('opens a page under its menu path and passes the base path', async () => {
    const Probe = ({ basePath }: { basePath: string }) => <p>base {basePath}</p>;
    renderAt('/admin/roles/123', {
      routes: [{ key: 'role_management', path: '/admin/roles' }],
      navigation: [],
      pages: { role_management: lazy(() => Promise.resolve({ default: Probe })) },
    });
    expect(await screen.findByText('base /admin/roles')).toBeInTheDocument();
  });

  it('opens a View-only menu that is not in the sidebar', () => {
    renderAt('/blood/donars', { navigation: [] });
    expect(screen.getByText('Under construction')).toBeInTheDocument();
  });

  it('answers 404 for a path no route covers, even if a sidebar entry has it', () => {
    renderAt('/blood/donars', { routes: [] });
    expect(screen.getByRole('heading', { name: 'This page does not exist' })).toBeInTheDocument();
  });
});
