import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/States';
import { useAuth } from '@/context/authState';
import { FullPageSpinner } from '@/features/status/FullPageSpinner';
import { userMessage } from '@/lib/errors';
import { findRoute, routeLabel } from '@/lib/menus';

/** Auth gate + shell. Signed-out visitors go to /login?next=... */
export function ProtectedLayout() {
  const { t } = useTranslation();
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (auth.status === 'booting' || auth.loadingProfile) return <FullPageSpinner />;
  if (auth.status === 'anonymous') {
    const next = location.pathname + location.search;
    return (
      <Navigate to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`} replace />
    );
  }
  if (!auth.me) {
    return (
      <div className="min-h-screen bg-canvas">
        <ErrorState
          title={t('status.profileError.title')}
          message={userMessage(auth.profileError)}
          onRetry={() => void auth.refreshProfile()}
        />
      </div>
    );
  }

  const current = findRoute(auth.routes, location.pathname);
  return (
    <AppShell
      navigation={auth.navigation}
      user={auth.me.user}
      title={current ? routeLabel(current, auth.navigation) : ''}
      onSignOut={() => void auth.logout().then(() => navigate('/login', { replace: true }))}
    >
      <Outlet />
    </AppShell>
  );
}
