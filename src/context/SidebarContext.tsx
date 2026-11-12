import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { storage } from '@/lib/storage';
import { DESKTOP_QUERY, useMediaQuery } from '@/lib/useMediaQuery';
import { SidebarContext, type SidebarState } from './sidebarState';

const STORAGE_KEY = 'bm.sidebar.collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [collapsed, setCollapsed] = useState(() => storage.get(STORAGE_KEY, false));
  // The drawer remembers which page it was opened on: navigating away or widening the window
  // closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const { pathname } = useLocation();
  const mobileOpen = !isDesktop && openedOn === pathname;
  const setMobileOpen = useCallback(
    (open: boolean | ((o: boolean) => boolean)) =>
      setOpenedOn((prev) => {
        const current = prev === pathname;
        const next = typeof open === 'function' ? open(current) : open;
        return next ? pathname : null;
      }),
    [pathname],
  );

  useEffect(() => storage.set(STORAGE_KEY, collapsed), [collapsed]);

  const toggle = useCallback(() => {
    if (isDesktop) setCollapsed((c) => !c);
    else setMobileOpen((o) => !o);
  }, [isDesktop, setMobileOpen]);

  const value = useMemo<SidebarState>(
    () => ({
      isDesktop,
      // On small screens the drawer always shows labels.
      collapsed: isDesktop && collapsed,
      mobileOpen,
      toggle,
      closeMobile: () => setMobileOpen(false),
    }),
    [isDesktop, collapsed, mobileOpen, toggle, setMobileOpen],
  );
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
