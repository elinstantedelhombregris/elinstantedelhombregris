import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { StrictMode, Suspense, useEffect } from 'react';

import { AppRoutes } from './app-routes';

import { XpToast } from '~/components/XpToast';
import { RootLayout } from '~/layouts/RootLayout';
import { queryClient } from '~/lib/query-client';
import { xpEventBus } from '~/lib/xp-event-bus';

function GamificationCacheBridge(): null {
  const queryClient = useQueryClient();
  useEffect(() => {
    return xpEventBus.subscribe(() => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'me'] });
    });
  }, [queryClient]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-muted-foreground font-mono text-sm">
        Cargando — menos que un trámite.
      </span>
    </div>
  );
}

export function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RootLayout>
          <Suspense fallback={<PageFallback />}>
            <AppRoutes />
          </Suspense>
        </RootLayout>
        <GamificationCacheBridge />
        <XpToast />
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
