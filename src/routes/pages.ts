import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { APP_ACTIONS, type AppAction } from '@/lib/permissions';

export interface PageProps {
  /** The menu path this page is mounted at; the page routes the addresses below it. */
  basePath: string;
}

export type PageRegistry = Readonly<Record<string, LazyExoticComponent<ComponentType<PageProps>>>>;

/** Real pages by App hub menu key; other menus show Under Construction. */
export const PAGES: PageRegistry = {
  dashboard: lazy(() => import('@/features/dashboard/DashboardPage')),
  role_management: lazy(() => import('@/features/roles/RolesPage')),
  staff_management: lazy(() => import('@/features/staff/StaffPage')),
};

/**
 * Operations each menu's page supports, which the role editor offers (ADR 0023). A key not
 * listed supports all four. The backend accepts every action regardless; this shapes the editor.
 */
export const MENU_OPERATIONS: Readonly<Record<string, readonly AppAction[]>> = {
  dashboard: ['read'],
  staff_management: ['read', 'create', 'update'],
};

export function operationsOf(menuKey: string): readonly AppAction[] {
  return MENU_OPERATIONS[menuKey] ?? APP_ACTIONS;
}
