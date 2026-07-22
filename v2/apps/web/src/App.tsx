import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense, useEffect } from 'react';
import { Redirect, Route, Switch } from 'wouter';

import { XpToast } from '~/components/XpToast';
import { RootLayout } from '~/layouts/RootLayout';
import { queryClient } from '~/lib/query-client';
import { xpEventBus } from '~/lib/xp-event-bus';

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
const TwoFactorChallenge = lazy(async () => {
  const m = await import('~/pages/TwoFactorChallenge');
  return { default: m.TwoFactorChallenge };
});
const Manifiesto = lazy(async () => {
  const m = await import('~/pages/Manifiesto');
  return { default: m.Manifiesto };
});
const LaIdea = lazy(async () => {
  const m = await import('~/pages/LaIdea');
  return { default: m.LaIdea };
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
const WeeklyCheckin = lazy(async () => {
  const m = await import('~/pages/WeeklyCheckin');
  return { default: m.WeeklyCheckin };
});
const ElMandatoVivo = lazy(async () => {
  const m = await import('~/pages/ElMandatoVivo');
  return { default: m.ElMandatoVivo };
});
const BlogAuthor = lazy(async () => {
  const m = await import('~/pages/BlogAuthor');
  return { default: m.BlogAuthor };
});
const ExplorarDatos = lazy(async () => {
  const m = await import('~/pages/ExplorarDatos');
  return { default: m.ExplorarDatos };
});
const DatosAbiertos = lazy(async () => {
  const m = await import('~/pages/DatosAbiertos');
  return { default: m.DatosAbiertos };
});
const InsightDashboard = lazy(async () => {
  const m = await import('~/pages/InsightDashboard');
  return { default: m.InsightDashboard };
});
const MiPerfil = lazy(async () => {
  const m = await import('~/pages/MiPerfil');
  return { default: m.MiPerfil };
});
const Leaderboard = lazy(async () => {
  const m = await import('~/pages/Leaderboard');
  return { default: m.Leaderboard };
});
const Desafios = lazy(async () => {
  const m = await import('~/pages/Desafios');
  return { default: m.Desafios };
});
const IniciativaDetail = lazy(async () => {
  const m = await import('~/pages/IniciativaDetail');
  return { default: m.IniciativaDetail };
});
const IniciativaDocumento = lazy(async () => {
  const m = await import('~/pages/IniciativaDocumento');
  return { default: m.IniciativaDocumento };
});
const PulsoDetail = lazy(async () => {
  const m = await import('~/pages/PulsoDetail');
  return { default: m.PulsoDetail };
});
const PropuestaDetail = lazy(async () => {
  const m = await import('~/pages/PropuestaDetail');
  return { default: m.PropuestaDetail };
});
const Bienvenida = lazy(async () => {
  const m = await import('~/pages/Bienvenida');
  return { default: m.Bienvenida };
});
const ApoyaAlMovimiento = lazy(async () => {
  const m = await import('~/pages/ApoyaAlMovimiento');
  return { default: m.ApoyaAlMovimiento };
});
const PoliticaPrivacidad = lazy(async () => {
  const m = await import('~/pages/PoliticaPrivacidad');
  return { default: m.PoliticaPrivacidad };
});

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
      <span className="font-mono text-sm text-muted-foreground">Cargando — menos que un trámite.</span>
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
              <Route path="/2fa-desafio" component={TwoFactorChallenge} />
              <Route path="/bienvenida" component={Bienvenida} />
              <Route path="/apoyo" component={ApoyaAlMovimiento} />
              <Route path="/politica-privacidad" component={PoliticaPrivacidad} />

              {/* ¡BASTA! framework */}
              <Route path="/manifiesto" component={Manifiesto} />
              {/* La idea — fusión papel de las v1 /la-vision + /el-instante-del-hombre-gris */}
              <Route path="/la-idea" component={LaIdea} />
              <Route path="/la-vision">
                <Redirect to="/la-idea" replace />
              </Route>
              <Route path="/el-instante-del-hombre-gris">
                <Redirect to="/la-idea" replace />
              </Route>
              <Route path="/la-semilla-de-basta" component={LaSemillaDeBasta} />
              <Route path="/una-ruta-para-argentina" component={UnaRutaParaArgentina} />
              <Route path="/el-mapa" component={ElMapa} />
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
              <Route path="/check-in-semanal" component={WeeklyCheckin} />
              <Route path="/coaching" component={CoachingChat} />

              {/* Mandato Vivo — detail routes MUST come before the bare landing. */}
              <Route path="/mandato-vivo/pulso/:id" component={PulsoDetail} />
              <Route path="/mandato-vivo/propuesta/:id" component={PropuestaDetail} />
              <Route path="/mandato-vivo" component={ElMandatoVivo} />
              <Route path="/mi-perfil" component={MiPerfil} />
              <Route path="/clasificacion" component={Leaderboard} />
              <Route path="/desafios" component={Desafios} />

              {/* Content + community */}
              <Route path="/ensayos" component={Ensayos} />
              <Route path="/ensayos/:slug" component={EnsayoDetail} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/escribir" component={BlogAuthor} />
              <Route path="/blog/:slug" component={BlogPostDetail} />
              <Route path="/comunidad" component={Community} />
              <Route path="/notificaciones" component={Notifications} />

              {/* Iniciativas — documento route MUST come before bare :slug. */}
              <Route path="/iniciativas/:slug/documento" component={IniciativaDocumento} />
              <Route path="/iniciativas/:slug" component={IniciativaDetail} />

              {/* Open data + analytics */}
              <Route path="/explorar-datos" component={ExplorarDatos} />
              <Route path="/datos-abiertos" component={DatosAbiertos} />
              <Route path="/tablero" component={InsightDashboard} />

              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </RootLayout>
        <GamificationCacheBridge />
        <XpToast />
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
