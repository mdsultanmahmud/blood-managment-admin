import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavNode } from '@/api/schemas';
import { SidebarProvider } from '@/context/SidebarContext';
import { AppFooter } from './AppFooter';
import { Sidebar } from './Sidebar';
import { Topbar, type ShellUser } from './Topbar';

/**
 * Sidebar + top bar + scrolling content + footer. The menu comes from the backend, pages from
 * routes.
 */
export function AppShell({
  navigation,
  user,
  title,
  onSignOut,
  children,
}: {
  navigation: NavNode[];
  user: ShellUser;
  title: string;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only z-[2000] rounded-sm bg-surface px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t('shell.skipToContent')}
      </a>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar items={navigation} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} user={user} onSignOut={onSignOut} />
          <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
