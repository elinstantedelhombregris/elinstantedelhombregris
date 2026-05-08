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
const Planes = lazy(async () => {
  const m = await import('~/pages/Planes');
  return { default: m.Planes };
});
const PlanDetail = lazy(async () => {
  const m = await import('~/pages/PlanDetail');
  return { default: m.PlanDetail };
});
const LifeAreasDashboard = lazy(async () => {
  const m = await import('~/pages/LifeAreasDashboard');
  return { default: m.LifeAreasDashboard };
});
const LifeAreaDetail = lazy(async () => {
  const m = await import('~/pages/LifeAreaDetail');
  return { default: m.LifeAreaDetail };
});
const CivicAssessment = lazy(async () => {
  const m = await import('~/pages/CivicAssessment');
  return { default: m.CivicAssessment };
});
const Goals = lazy(async () => {
  const m = await import('~/pages/Goals');
  return { default: m.Goals };
});
const CoachingChat = lazy(async () => {
  const m = await import('~/pages/CoachingChat');
  return { default: m.CoachingChat };
});
const Ensayos = lazy(async () => {
  const m = await import('~/pages/Ensayos');
  return { default: m.Ensayos };
});
const EnsayoDetail = lazy(async () => {
  const m = await import('~/pages/EnsayoDetail');
  return { default: m.EnsayoDetail };
});
const Blog = lazy(async () => {
  const m = await import('~/pages/Blog');
  return { default: m.Blog };
});
const BlogPostDetail = lazy(async () => {
  const m = await import('~/pages/BlogPostDetail');
  return { default: m.BlogPostDetail };
});
const Community = lazy(async () => {
  const m = await import('~/pages/Community');
  return { default: m.Community };
});
const Notifications = lazy(async () => {
  const m = await import('~/pages/Notifications');
  return { default: m.Notifications };
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

              {/* PLAN catalog */}
              <Route path="/planes" component={Planes} />
              <Route path="/planes/:slug" component={PlanDetail} />

              {/* Life areas (auth-gated) */}
              <Route path="/areas" component={LifeAreasDashboard} />
              <Route path="/areas/:slug" component={LifeAreaDetail} />

              {/* Civic assessment (auth-gated) */}
              <Route path="/auto-evaluacion-civica" component={CivicAssessment} />

              {/* Goals + coaching (auth-gated) */}
              <Route path="/objetivos" component={Goals} />
              <Route path="/coaching" component={CoachingChat} />

              {/* Content + community */}
              <Route path="/ensayos" component={Ensayos} />
              <Route path="/ensayos/:slug" component={EnsayoDetail} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={BlogPostDetail} />
              <Route path="/comunidad" component={Community} />
              <Route path="/notificaciones" component={Notifications} />

              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </RootLayout>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
