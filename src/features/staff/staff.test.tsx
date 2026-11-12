import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { rolesApi } from '@/api/modules/roles';
import { staffApi, type Staff } from '@/api/modules/staff';
import { AuthContext } from '@/context/authState';
import { ModalProvider } from '@/context/ModalContext';
import { fakeAuth } from '@/test/fixtures';
import StaffPage from './StaffPage';

vi.mock('@/api/modules/staff', () => ({
  staffApi: {
    list: vi.fn(),
    roles: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setPassword: vi.fn(),
  },
}));
vi.mock('@/api/modules/roles', () => ({
  rolesApi: { list: vi.fn(), menus: vi.fn(), get: vi.fn() },
}));

const SELF_ID = 'u-1';
const ADMIN_ROLE = { id: 'r-admin', name: 'Admin', isLocked: true };
const DESK_ROLE = { id: 'r-desk', name: 'Desk', isLocked: false };
const SELF: Staff = {
  id: SELF_ID,
  name: 'Club Admin',
  email: 'admin@roktolife.test',
  status: 'ACTIVE',
  roles: [ADMIN_ROLE],
  lastLoginAt: '2026-10-15T10:00:00.000Z',
  createdAt: '2026-10-12T10:00:00.000Z',
};
const RAHIM: Staff = {
  id: 'u-2',
  name: 'Rahim',
  email: 'rahim@roktolife.test',
  status: 'ACTIVE',
  roles: [DESK_ROLE],
  lastLoginAt: null,
  createdAt: '2026-10-15T10:00:00.000Z',
};

function renderStaff(auth: { isAdmin?: boolean; permissions: string[] }) {
  const permissions = new Set(auth.permissions);
  const value = fakeAuth({
    isAdmin: auth.isAdmin ?? true,
    permissions,
    can: (p) => permissions.has(p),
  });
  const router = createMemoryRouter(
    [{ path: '*', element: <StaffPage basePath="/admin/staff" /> }],
    {
      initialEntries: ['/admin/staff'],
    },
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

const rowOf = async (email: string) => {
  // AG Grid's first render is slow in jsdom under a full parallel run.
  const cell = await screen.findByText(email, undefined, { timeout: 15_000 });
  const row = cell.closest('[role="row"]');
  if (!(row instanceof HTMLElement)) throw new Error(`No row for ${email}`);
  return row;
};

// AG Grid in jsdom is slow to mount under a full parallel run; give these tests room.
describe('Staff page', { timeout: 20_000 }, () => {
  beforeEach(() => {
    vi.mocked(staffApi.list).mockResolvedValue({
      data: [SELF, RAHIM],
      meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
    });
    // Staff managers may lack Roles access: the page must not depend on GET /roles.
    vi.mocked(rolesApi.list).mockRejectedValue(new ApiError(403, 'FORBIDDEN', 'forbidden'));
    vi.mocked(staffApi.roles).mockResolvedValue([ADMIN_ROLE, DESK_ROLE]);
    vi.mocked(staffApi.create).mockResolvedValue(RAHIM);
  });

  it('hides Add staff and row actions without the permissions', async () => {
    renderStaff({ permissions: ['staff_management:read'] });
    await rowOf('rahim@roktolife.test');
    expect(screen.queryByRole('button', { name: 'Add staff' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Actions for Rahim' })).toBeNull();
  });

  it('offers no Disable or Set password on the signed-in user’s own row', async () => {
    const user = userEvent.setup();
    renderStaff({ permissions: ['staff_management:read', 'staff_management:update'] });
    const own = await rowOf('admin@roktolife.test');
    await user.click(within(own).getByRole('button', { name: 'Actions for Club Admin' }));
    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Disable' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Set password' })).toBeNull();
  });

  it('adds staff and shows COMPANY_USER_EMAIL_TAKEN under the email field', async () => {
    vi.mocked(staffApi.create).mockRejectedValueOnce(
      new ApiError(409, 'COMPANY_USER_EMAIL_TAKEN', 'taken'),
    );
    const user = userEvent.setup();
    renderStaff({ permissions: ['staff_management:create', 'staff_management:read'] });
    await user.click(await screen.findByRole('button', { name: 'Add staff' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Karim');
    await user.type(within(dialog).getByLabelText('Email'), 'rahim@roktolife.test');
    await user.type(within(dialog).getByLabelText('Password'), 'Correct-Horse-9');
    await user.click(within(dialog).getByLabelText('Roles'));
    await user.click(await screen.findByRole('option', { name: 'Desk' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add staff' }));
    expect(staffApi.create).toHaveBeenCalledWith({
      name: 'Karim',
      email: 'rahim@roktolife.test',
      password: 'Correct-Horse-9',
      roleIds: ['r-desk'],
    });
    expect(
      await within(dialog).findByText('Another user of your company has this email.'),
    ).toBeInTheDocument();
  });

  it('disables the Admin role in the picker for non-Admins', async () => {
    const user = userEvent.setup();
    renderStaff({
      isAdmin: false,
      permissions: ['staff_management:create', 'staff_management:read'],
    });
    await user.click(await screen.findByRole('button', { name: 'Add staff' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByLabelText('Roles'));
    const admin = await screen.findByRole('option', { name: /Admin/ });
    expect(admin).toHaveAttribute('aria-disabled', 'true');
  });
});
