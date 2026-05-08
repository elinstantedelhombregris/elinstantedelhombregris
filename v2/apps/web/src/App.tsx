import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense } from 'react';
import { Route, Switch } from 'wouter';

import { queryClient } from '~/lib/query-client';

// Lazy-load every page so each route ships its own chunk.
const Home = lazy(async () => {
  const m = await import('~/pages/Home');
  return { default: m.Home };
});
const NotFound = lazy(async () => {
  const m = await import('~/pages/NotFound');
  return { default: m.NotFound };
});

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="font-mono text-sm text-muted-foreground">cargando…</span>
    </div>
  );
}

export function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<PageFallback />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
