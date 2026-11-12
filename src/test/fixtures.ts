import type { NavNode, Site } from '@/api/schemas';
import type { AuthState } from '@/context/authState';
import type { SiteState } from '@/context/siteState';

export const SITE: Site = {
  company: {
    name: 'Club 71',
    title: 'Club 71',
    logoUrl: '/api/v1/company/site/logo?origin=http%3A%2F%2Froktolife.localhost%3A5174&v=1',
  },
  app: { name: 'Social Club Management', slug: 'social_club_management' },
  themeKey: 'roktolife',
  languages: ['en'],
  defaultLanguage: 'en',
};

export function readySite(site: Site = SITE): SiteState {
  return { status: 'ready', site, error: null, retry: () => undefined };
}

export function fakeAuth(overrides: Partial<AuthState> = {}): AuthState {
  return {
    status: 'authenticated',
    isAuthenticated: true,
    me: {
      user: { id: 'u-1', name: 'Club Admin', email: 'admin@roktolife.test' },
      company: { id: 'c-1', name: 'Club 71' },
      app: { id: 'a-1', name: 'Social Club Management', slug: 'social_club_management' },
      roles: ['Admin'],
      isAdmin: true,
      permissions: [],
    },
    permissions: new Set(),
    navigation: [],
    routes: [],
    isAdmin: true,
    loadingProfile: false,
    profileError: null,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    can: () => false,
    refreshProfile: () => Promise.resolve(),
    ...overrides,
  };
}

const node = (key: string, path: string | null, children: NavNode[] = []): NavNode => ({
  key,
  label: `L-${key}`,
  icon: null,
  path,
  children,
});

/** dashboard, blood_bank > blood_donars, admin_settings > languages > codes. */
export const NAV: NavNode[] = [
  node('dashboard', '/'),
  node('blood_bank', null, [node('blood_donars', '/blood/donars')]),
  node('admin_settings', null, [node('languages', null, [node('codes', '/admin/codes')])]),
];
