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
const Login = lazy(async () => {
  const m = await import('~/pages/Login');
  return { default: m.Login };
});
const Register = lazy(async () => {
  const m = await import('~/pages/Register');
  return { default: m.Register };
});
const ForgotPassword = lazy(async () => {
  const m = await import('~/pages/ForgotPassword');
  return { default: m.ForgotPassword };
});
const ResetPassword = lazy(async () => {
  const m = await import('~/pages/ResetPassword');
  return { default: m.ResetPassword };
});
const VerifyEmail = lazy(async () => {
  const m = await import('~/pages/VerifyEmail');
  return { default: m.VerifyEmail };
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
            <Route path="/ingresar" component={Login} />
            <Route path="/registrarse" component={Register} />
            <Route path="/recuperar-contrasena" component={ForgotPassword} />
            <Route path="/restablecer-contrasena" component={ResetPassword} />
            <Route path="/verificar-email" component={VerifyEmail} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
