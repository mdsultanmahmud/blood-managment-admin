import { createContext, useContext } from 'react';
import type { AppRoute, Me, NavNode } from '@/api/schemas';

export type AuthStatus = 'booting' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  isAuthenticated: boolean;
  /** GET /me (null until loaded). */
  me: Me | null;
  /** `<menuKey>:<action>` keys from GET /me. */
  permissions: ReadonlySet<string>;
  navigation: NavNode[];
  /** Pages the user may open, from GET /me/navigation (sidebar or not). */
  routes: AppRoute[];
  /** Holds the locked Admin role. */
  isAdmin: boolean;
  loadingProfile: boolean;
  profileError: unknown;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
