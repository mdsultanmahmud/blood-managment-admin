import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { rolesApi, type Role, type RoleSummary } from '@/api/modules/roles';
import type { NavNode } from '@/api/schemas';
import { AuthContext } from '@/context/authState';
import { ModalProvider } from '@/context/ModalContext';
import { fakeAuth } from '@/test/fixtures';
import RolesPage from './RolesPage';

vi.mock('@/api/modules/roles', () => ({
  rolesApi: {
    menus: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const node = (key: string, label: string, path: string | null, children: NavNode[] = []) => ({
  key,
  label,
  icon: null,
  path,
  children,
});
const TREE: NavNode[] = [
  node('dashboard', 'Dashboard', '/'),
  node('blood_bank', 'Blood Bank', null, [node('blood_donars', 'Blood Donars', '/blood/donars')]),
  node('admin_settings', 'Admin Settings', null, [
    node('role_management', 'Role Management', '/admin/roles'),
  ]),
];
const all = { visible: true, read: true, create: true, update: true, delete: true };
const ADMIN_ROLE: Role = {
  id: ADMIN_ID,
  name: 'Admin',
  isLocked: true,
  menus: ['dashboard', 'blood_donars', 'role_management'].map((menuKey) => ({ menuKey, ...all })),
};
const ADMIN_SUMMARY: RoleSummary = {
  id: ADMIN_ID,
  name: 'Admin',
  isLocked: true,
  menuCount: null,
  userCount: 1,
  createdAt: '2026-10-12T10:00:00.000Z',
  updatedAt: '2026-10-12T10:00:00.000Z',
};

function renderRoles(path: string, auth: { isAdmin?: boolean; permissions?: string[] } = {}) {
  const permissions = new Set(auth.permissions ?? []);
  const value = fakeAuth({
    isAdmin: auth.isAdmin ?? true,
    permissions,
    can: (p) => (auth.isAdmin ?? true) || permissions.has(p),
    navigation:
      auth.isAdmin === false ? [node('blood_donars', 'Blood Donars', '/blood/donars')] : TREE,
  });
  const router = createMemoryRouter(
    [{ path: '*', element: <RolesPage basePath="/admin/roles" /> }],
    { initialEntries: [path] },
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={value}>
        <ModalProvider>
          <RouterProvider router={router} />
        </ModalProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Roles page', () => {
  beforeEach(() => {
    vi.mocked(rolesApi.menus).mockResolvedValue(TREE);
    vi.mocked(rolesApi.list).mockResolvedValue({
      data: [ADMIN_SUMMARY],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
    vi.mocked(rolesApi.get).mockResolvedValue(ADMIN_ROLE);
    vi.mocked(rolesApi.create).mockImplementation((body) =>
      Promise.resolve({ id: '22222222-2222-4222-8222-222222222222', isLocked: false, ...body }),
    );
  });

  it('hides New role without role_management:create', async () => {
    renderRoles('/admin/roles', { isAdmin: false, permissions: ['role_management:read'] });
    expect(await screen.findByRole('heading', { name: 'Roles' })).toBeInTheDocument();
    expect(rolesApi.list).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'New role' })).toBeNull();
  });

  it('shows New role with role_management:create', async () => {
    renderRoles('/admin/roles');
    expect(await screen.findByRole('button', { name: 'New role' })).toBeInTheDocument();
  });

  it('shows a dash for operations a page does not declare and disables cells the editor lacks', async () => {
    renderRoles('/admin/roles/new', {
      isAdmin: false,
      permissions: ['role_management:create', 'role_management:read', 'blood_donars:read'],
    });
    expect(await screen.findByRole('checkbox', { name: 'Dashboard: View' })).toBeDisabled();
    expect(screen.queryByRole('checkbox', { name: 'Dashboard: Create' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Blood Donars: View' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Blood Donars: Create' })).toBeDisabled();
  });

  it('turns View on when Create is checked, and creates the role', async () => {
    const user = userEvent.setup();
    renderRoles('/admin/roles/new');
    await user.type(await screen.findByLabelText('Name'), 'Blood desk');
    await user.click(screen.getByRole('checkbox', { name: 'Blood Donars: Create' }));
    expect(screen.getByRole('checkbox', { name: 'Blood Donars: View' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Create role' }));
    expect(rolesApi.create).toHaveBeenCalledWith({
      name: 'Blood desk',
      menus: [
        {
          menuKey: 'blood_donars',
          visible: false,
          read: true,
          create: true,
          update: false,
          delete: false,
        },
      ],
    });
  });

  it('shows ROLE_NAME_TAKEN under the name field', async () => {
    vi.mocked(rolesApi.create).mockRejectedValueOnce(new ApiError(409, 'ROLE_NAME_TAKEN', 'taken'));
    const user = userEvent.setup();
    renderRoles('/admin/roles/new');
    await user.type(await screen.findByLabelText('Name'), 'Admin team');
    await user.click(screen.getByRole('button', { name: 'Create role' }));
    expect(await screen.findByText('Another role already uses this name.')).toBeInTheDocument();
  });

  it('opens the Admin role read-only', async () => {
    renderRoles(`/admin/roles/${ADMIN_ID}`);
    expect(
      await screen.findByText(
        'The Admin role can do everything your company has. It cannot be changed.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Blood Donars: Delete' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Blood Donars: Delete' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save role' })).toBeNull();
  });
});
