import { describe, expect, it } from 'vitest';
import { NAV } from '@/test/fixtures';
import { findRoute, menuLabel, menuLeaves } from './menus';

describe('menus', () => {
  it('lists linkable menus at any depth, in menu order', () => {
    expect(menuLeaves(NAV).map((l) => l.key)).toEqual(['dashboard', 'blood_donars', 'codes']);
  });

  it('uses the App hub label until menu.<key> is translated', () => {
    expect(menuLabel({ key: 'blood_donars', label: 'Blood Donars' })).toBe('Blood Donars');
  });
});

describe('findRoute', () => {
  const routes = [
    { key: 'dashboard', path: '/' },
    { key: 'role_management', path: '/admin/roles' },
    { key: 'roles_archive', path: '/admin/roles/archive' },
  ];

  it('matches the longest path that is a prefix of the address', () => {
    expect(findRoute(routes, '/admin/roles')?.key).toBe('role_management');
    expect(findRoute(routes, '/admin/roles/new')?.key).toBe('role_management');
    expect(findRoute(routes, '/admin/roles/archive/2')?.key).toBe('roles_archive');
  });

  it('matches / only exactly, and never a partial segment', () => {
    expect(findRoute(routes, '/')?.key).toBe('dashboard');
    expect(findRoute(routes, '/elsewhere')).toBeNull();
    expect(findRoute(routes, '/admin/rolesx')).toBeNull();
  });
});
