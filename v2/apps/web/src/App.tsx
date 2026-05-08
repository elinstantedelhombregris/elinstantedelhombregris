import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense } from 'react';
import { Route, Switch } from 'wouter';

import { RootLayout } from '~/layouts/RootLayout';
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
const Manifiesto = lazy(async () => {
  const m = await import('~/pages/Manifiesto');
  return { default: m.Manifiesto };
});
const LaVision = lazy(async () => {
  const m = await import('~/pages/LaVision');
  return { default: m.LaVision };
});
const LaSemillaDeBasta = lazy(async () => {
  const m = await import('~/pages/LaSemillaDeBasta');
  return { default: m.LaSemillaDeBasta };
});
const UnaRutaParaArgentina = lazy(async () => {
  const m = await import('~/pages/UnaRutaParaArgentina');
  return { default: m.UnaRutaParaArgentina };
});
const ElMapa = lazy(async () => {
  const m = await import('~/pages/ElMapa');
  return { default: m.ElMapa };
});
const ElInstanteDelHombreGris = lazy(async () => {
  const m = await import('~/pages/ElInstanteDelHombreGris');
  return { default: m.ElInstanteDelHombreGris };
});
const DetallesCalculoCostoHumano = lazy(async () => {
  const m = await import('~/pages/DetallesCalculoCostoHumano');
  return { default: m.DetallesCalculoCostoHumano };
});
const KitDePrensa = lazy(async () => {
  const m = await import('~/pages/KitDePrensa');
  return { default: m.KitDePrensa };
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
        <RootLayout>
          <Suspense fallback={<PageFallback />}>
            <Switch>
              <Route path="/" component={Home} />

              {/* Auth */}
              <Route path="/ingresar" component={Login} />
              <Route path="/registrarse" component={Register} />
              <Route path="/recuperar-contrasena" component={ForgotPassword} />
              <Route path="/restablecer-contrasena" component={ResetPassword} />
              <Route path="/verificar-email" component={VerifyEmail} />

              {/* ¡BASTA! framework */}
              <Route path="/manifiesto" component={Manifiesto} />
              <Route path="/la-vision" component={LaVision} />
              <Route path="/la-semilla-de-basta" component={LaSemillaDeBasta} />
              <Route path="/una-ruta-para-argentina" component={UnaRutaParaArgentina} />
              <Route path="/el-mapa" component={ElMapa} />
              <Route path="/el-instante-del-hombre-gris" component={ElInstanteDelHombreGris} />
              <Route path="/detalles-calculo-costo-humano" component={DetallesCalculoCostoHumano} />
              <Route path="/kit-de-prensa" component={KitDePrensa} />

              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </RootLayout>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
