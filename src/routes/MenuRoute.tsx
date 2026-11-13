import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { UnderConstructionPage } from '@/features/status/UnderConstructionPage';
import { findRoute, menuLeaves, routeLabel } from '@/lib/menus';
import { PAGES, type PageRegistry } from './pages';
import { NotFoundPage } from './StatusPages';

/**
 * Every signed-in path lands here: the routes from the server decide which paths exist (the
 * longest menu path that prefixes the address), the page registry which ones are built. A menu
 * the user may not view, or one switched off in BC, is not in the routes, so its URL answers 404.
 */
export function MenuRoute({ pages = PAGES }: { pages?: PageRegistry }) {
  const { t } = useTranslation();
  const { navigation, routes } = useAuth();
  const { pathname } = useLocation();
  const route = findRoute(routes, pathname);

  if (!route) {
    if (pathname !== '/') return <NotFoundPage />;
    const first = menuLeaves(navigation)[0] ?? routes[0];
    return first ? (
      <Navigate to={first.path} replace />
    ) : (
      <EmptyState title={t('status.noMenus.title')} description={t('status.noMenus.message')} />
    );
  }

  const Page = pages[route.key];
  if (!Page) return <UnderConstructionPage name={routeLabel(route, navigation)} />;
  return (
    <Suspense fallback={<LoadingState />}>
      <Page basePath={route.path} />
    </Suspense>
  );
}
