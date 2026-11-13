import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { SiteProvider } from './context/SiteContext';
import { SiteGate } from './features/status/SiteGate';
import { AppToaster } from './lib/AppToaster';
import { createQueryClient } from './lib/queryClient';
import { createAppRouter } from './routes/router';
import { SiteTheme } from './themes/SiteTheme';

/** Site first (company, theme, language), then the session, then modals and the routes. */
export function App() {
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(createAppRouter);
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SiteProvider>
          <SiteTheme>
            <SiteGate>
              <AuthProvider>
                <ModalProvider>
                  <RouterProvider router={router} />
                </ModalProvider>
                <AppToaster />
              </AuthProvider>
            </SiteGate>
          </SiteTheme>
        </SiteProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
