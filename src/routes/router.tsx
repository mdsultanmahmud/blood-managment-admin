import { createBrowserRouter } from 'react-router';
import { FullPageSpinner } from '@/features/status/FullPageSpinner';
import { MenuRoute } from './MenuRoute';
import { ProtectedLayout } from './ProtectedLayout';
import { RouteErrorPage } from './StatusPages';

/** Two routes: the login page, and every other path resolved against the navigation. */
export function createAppRouter() {
  return createBrowserRouter([
    {
      hydrateFallbackElement: <FullPageSpinner />,
      errorElement: <RouteErrorPage />,
      children: [
        {
          path: '/login',
          lazy: async () => ({ Component: (await import('@/features/auth/LoginPage')).default }),
        },
        {
          element: <ProtectedLayout />,
          children: [
            { errorElement: <RouteErrorPage />, children: [{ path: '*', element: <MenuRoute /> }] },
          ],
        },
      ],
    },
  ]);
}
