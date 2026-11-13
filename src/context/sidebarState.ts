import { createContext, useContext } from 'react';

export interface SidebarState {
  isDesktop: boolean;
  /** Icons-only mode (desktop only; persisted). */
  collapsed: boolean;
  /** Overlay drawer open (small screens only). */
  mobileOpen: boolean;
  toggle: () => void;
  closeMobile: () => void;
}

export const SidebarContext = createContext<SidebarState | null>(null);

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider');
  return ctx;
}
