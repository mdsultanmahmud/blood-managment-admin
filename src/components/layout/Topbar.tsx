import { useTranslation } from 'react-i18next';
import { LuLogOut, LuMenu } from 'react-icons/lu';
import { useSidebar } from '@/context/sidebarState';
import { Avatar } from '../ui/Avatar';
import { Menu } from '../ui/Menu';
import { LanguageSwitcher } from './LanguageSwitcher';

export interface ShellUser {
  name: string;
  email: string;
}

export function Topbar({
  title,
  user,
  onSignOut,
}: {
  title: string;
  user: ShellUser;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const { isDesktop, toggle, mobileOpen } = useSidebar();
  return (
    <header className="sticky top-0 z-[1100] flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-surface/95 px-4 backdrop-blur-sm lg:px-8">
      {!isDesktop && (
        <button
          type="button"
          onClick={toggle}
          aria-label={t('shell.topbar.openNav')}
          aria-expanded={mobileOpen}
          className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-sm text-neutral-700 hover:bg-neutral-100"
        >
          <LuMenu className="text-lg" aria-hidden />
        </button>
      )}
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">{title}</p>
      <LanguageSwitcher />
      <Menu
        label={t('shell.userMenu.label')}
        header={
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{user.name}</p>
            <p className="truncate text-[12.5px] text-neutral-600">{user.email}</p>
          </div>
        }
        items={[
          {
            key: 'signout',
            label: t('shell.userMenu.signOut'),
            icon: <LuLogOut />,
            onSelect: onSignOut,
          },
        ]}
        trigger={({ open, id }) => (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? id : undefined}
            aria-label={t('shell.userMenu.trigger', { name: user.name })}
            className="flex items-center gap-2.5 rounded-sm py-1 pr-2 pl-1 hover:bg-neutral-100"
          >
            <Avatar name={user.name} size={30} />
            <span className="hidden max-w-[160px] truncate text-sm font-medium text-neutral-800 sm:inline">
              {user.name}
            </span>
          </button>
        )}
      />
    </header>
  );
}
