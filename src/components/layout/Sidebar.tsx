import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronDown, LuPanelLeftClose, LuPanelLeftOpen, LuX } from 'react-icons/lu';
import { Link, NavLink, matchPath, useLocation, useNavigate } from 'react-router';
import type { NavNode } from '@/api/schemas';
import { useSidebar } from '@/context/sidebarState';
import { useReadySite } from '@/context/siteState';
import { cn } from '@/lib/cn';
import { apiUrl } from '@/lib/env';
import { menuLabel, menuLeaves } from '@/lib/menus';
import { storage } from '@/lib/storage';
import { Menu } from '../ui/Menu';
import { MenuIcon } from '../ui/MenuIcon';
import { Tooltip } from '../ui/Tooltip';

export const SIDEBAR_EXPANDED = 256;
export const SIDEBAR_COLLAPSED = 72;

/** Renders the server-filtered navigation tree as-is, to any depth. */
export function Sidebar({ items }: { items: NavNode[] }) {
  const { t } = useTranslation();
  const { isDesktop, collapsed, mobileOpen, toggle, closeMobile } = useSidebar();
  const reduce = useReducedMotion();

  if (!isDesktop) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[1200]">
            <motion.div
              className="absolute inset-0 bg-neutral-950/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.15 }}
              onClick={closeMobile}
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t('shell.sidebar.label')}
              className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-neutral-200 bg-surface shadow-layer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
              onKeyDown={(e) => e.key === 'Escape' && closeMobile()}
            >
              <SidebarHeader collapsed={false}>
                <button
                  type="button"
                  onClick={closeMobile}
                  aria-label={t('shell.sidebar.close')}
                  className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-sm text-neutral-600 hover:bg-neutral-100"
                >
                  <LuX aria-hidden />
                </button>
              </SidebarHeader>
              <NavTree items={items} collapsed={false} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      aria-label={t('shell.sidebar.label')}
      className="sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-surface"
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
    >
      <SidebarHeader collapsed={collapsed} />
      <NavTree items={items} collapsed={collapsed} />
      <div className="border-t border-neutral-200 p-3">
        <Tooltip label={t('shell.sidebar.expand')} disabled={!collapsed}>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? t('shell.sidebar.expand') : t('shell.sidebar.collapseLabel')}
            aria-expanded={!collapsed}
            className={cn(
              'flex h-9 w-full items-center gap-3 rounded-sm px-3 text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? (
              <LuPanelLeftOpen className="text-lg" aria-hidden />
            ) : (
              <LuPanelLeftClose className="text-lg" aria-hidden />
            )}
            {!collapsed && <span>{t('shell.sidebar.collapse')}</span>}
          </button>
        </Tooltip>
      </div>
    </motion.aside>
  );
}

function SidebarHeader({ collapsed, children }: { collapsed: boolean; children?: ReactNode }) {
  const { t } = useTranslation();
  const site = useReadySite();
  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200',
        collapsed ? 'justify-center' : 'px-4',
      )}
    >
      <Link
        to="/"
        aria-label={t('shell.sidebar.home')}
        className="flex min-w-0 items-center gap-2.5 rounded-sm px-1 py-1"
      >
        <img
          src={apiUrl(site.company.logoUrl)}
          alt=""
          className="h-7 w-7 shrink-0 rounded-sm object-contain"
        />
        {!collapsed && (
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-neutral-950">
              {site.company.title}
            </span>
            <span className="block truncate text-[11.5px] text-neutral-500">{site.app.name}</span>
          </span>
        )}
      </Link>
      {children}
    </div>
  );
}

const GROUPS_KEY = 'bm.sidebar.groups';

interface OpenGroups {
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
}

/** Expanded/collapsed state of each parent menu, remembered per browser. Open by default. */
function useOpenGroups(): OpenGroups {
  const [open, setOpen] = useState<Record<string, boolean>>(() => storage.get(GROUPS_KEY, {}));
  return {
    isOpen: (key) => open[key] ?? true,
    toggle: (key) =>
      setOpen((prev) => {
        const next = { ...prev, [key]: !(prev[key] ?? true) };
        storage.set(GROUPS_KEY, next);
        return next;
      }),
  };
}

/** True when the item, or any menu below it, matches the current location. */
function useIsActive() {
  const { pathname } = useLocation();
  const matches = (path: string | null) =>
    Boolean(path && matchPath({ path, end: false }, pathname));
  return (item: NavNode): boolean =>
    matches(item.path) || menuLeaves(item.children).some((l) => matches(l.path));
}

function NavTree({ items, collapsed }: { items: NavNode[]; collapsed: boolean }) {
  const groups = useOpenGroups();
  return (
    <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {items.map((item) => (
          <NavItem key={item.key} item={item} depth={0} collapsed={collapsed} groups={groups} />
        ))}
      </ul>
    </nav>
  );
}

/** A leaf links to its page; a parent opens its children, which may be parents again. */
function NavItem({
  item,
  depth,
  collapsed,
  groups,
}: {
  item: NavNode;
  depth: number;
  collapsed: boolean;
  groups: OpenGroups;
}) {
  if (item.children.length === 0) {
    return <NavEntry item={item} collapsed={collapsed} nested={depth > 0} />;
  }
  if (collapsed) return <NavGroupFlyout item={item} />;
  return <NavGroup item={item} depth={depth} groups={groups} />;
}

function NavGroup({ item, depth, groups }: { item: NavNode; depth: number; groups: OpenGroups }) {
  const reduce = useReducedMotion();
  const listId = useId();
  const active = useIsActive()(item);
  const open = groups.isOpen(item.key);
  return (
    <li>
      <button
        type="button"
        onClick={() => groups.toggle(item.key)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          'flex w-full items-center gap-3 rounded-sm text-sm transition-colors hover:bg-neutral-100',
          depth === 0 ? 'h-9 px-3' : 'h-8 px-2.5',
          active && !open
            ? 'font-semibold text-primary-800'
            : 'text-neutral-700 hover:text-neutral-950',
        )}
      >
        {depth === 0 && (
          <MenuIcon
            icon={item.icon}
            className={cn('shrink-0 text-[18px]', active ? 'text-primary-600' : 'text-neutral-500')}
          />
        )}
        <span className="flex-1 truncate text-left">{menuLabel(item)}</span>
        <LuChevronDown
          className={cn(
            'shrink-0 text-neutral-500 transition-transform',
            reduce ? 'duration-0' : 'duration-200',
            !open && '-rotate-90',
          )}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={listId}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
          >
            <ul
              className={cn(
                'mt-0.5 space-y-0.5 border-l border-neutral-200 pl-2',
                depth === 0 ? 'ml-[21px]' : 'ml-3',
              )}
            >
              {item.children.map((child) => (
                <NavItem
                  key={child.key}
                  item={child}
                  depth={depth + 1}
                  collapsed={false}
                  groups={groups}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Icon-only rail: a parent's icon opens every menu below it as a dropdown. */
function NavGroupFlyout({ item }: { item: NavNode }) {
  const navigate = useNavigate();
  const active = useIsActive()(item);
  const label = menuLabel(item);
  return (
    <li className="flex justify-center">
      <Menu
        label={label}
        align="start"
        header={<span className="text-[12px] font-medium text-neutral-500">{label}</span>}
        items={menuLeaves(item.children).map((leaf) => ({
          key: leaf.key,
          label: menuLabel(leaf),
          onSelect: () => void navigate(leaf.path),
        }))}
        trigger={({ open, id }) => (
          <Tooltip label={label} disabled={open}>
            <button
              type="button"
              aria-label={label}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? id : undefined}
              className={cn(
                'relative flex h-9 w-12 items-center justify-center rounded-sm transition-colors hover:bg-neutral-100',
                open && 'bg-neutral-100',
              )}
            >
              {active && (
                <span
                  className="absolute top-1.5 bottom-1.5 -left-3 w-[3px] rounded-r-sm bg-primary-600"
                  aria-hidden
                />
              )}
              <MenuIcon
                icon={item.icon}
                className={cn('text-[18px]', active ? 'text-primary-600' : 'text-neutral-500')}
              />
            </button>
          </Tooltip>
        )}
      />
    </li>
  );
}

function NavEntry({
  item,
  collapsed,
  nested,
}: {
  item: NavNode;
  collapsed: boolean;
  nested: boolean;
}) {
  if (!item.path) return null;
  const label = menuLabel(item);
  return (
    <li>
      <Tooltip label={label} disabled={!collapsed}>
        <NavLink
          to={item.path}
          end
          className={({ isActive }) =>
            cn(
              'relative flex w-full items-center gap-3 rounded-sm text-sm transition-colors',
              nested ? 'h-8 px-2.5' : 'h-9',
              !nested && (collapsed ? 'justify-center' : 'px-3'),
              isActive
                ? 'font-semibold text-primary-800'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950',
            )
          }
          aria-label={collapsed ? label : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className={cn(
                    'absolute top-1.5 bottom-1.5 w-[3px] bg-primary-600',
                    nested ? '-left-[10px] rounded-sm' : '-left-3 rounded-r-sm',
                  )}
                  aria-hidden
                />
              )}
              {!nested && (
                <MenuIcon
                  icon={item.icon}
                  className={cn(
                    'shrink-0 text-[18px]',
                    isActive ? 'text-primary-600' : 'text-neutral-500',
                  )}
                />
              )}
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      </Tooltip>
    </li>
  );
}
