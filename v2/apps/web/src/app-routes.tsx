import { lazy } from 'react';
import { Redirect, Route, Switch } from 'wouter';

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
const Sembrar = lazy(async () => {
  const m = await import('~/pages/Sembrar');
  return { default: m.Sembrar };
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
const Biblioteca = lazy(async () => {
  const m = await import('~/pages/Biblioteca');
  return { default: m.Biblioteca };
});
const EnsayoDetail = lazy(async () => {
  const m = await import('~/pages/EnsayoDetail');
  return { default: m.EnsayoDetail };
});
const Bitacora = lazy(async () => {
  const m = await import('~/pages/Bitacora');
  return { default: m.Bitacora };
});
const BitacoraDetail = lazy(async () => {
  const m = await import('~/pages/BitacoraDetail');
  return { default: m.BitacoraDetail };
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

/**
 * La tabla de rutas — extraída de `App.tsx` (fix de revisión sobre T8: el
 * archivo compuesto pasaba las 300 LOC del límite de `v2/CLAUDE.md`). Cero
 * cambio de comportamiento: los mismos lazy, las mismas rutas, el mismo
 * orden — solo movidos a su propio módulo para que `App.tsx` vuelva a
 * quedar bajo el límite.
 */
export function AppRoutes() {
  return (
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
      <Route path="/la-semilla-de-basta">
        <Redirect to="/sembrar" replace />
      </Route>
      <Route path="/sembrar" component={Sembrar} />
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
      <Route path="/biblioteca" component={Biblioteca} />
      <Route path="/ensayos">
        <Redirect to="/biblioteca" replace />
      </Route>
      <Route path="/ensayos/:slug" component={EnsayoDetail} />
      <Route path="/bitacora" component={Bitacora} />
      <Route path="/bitacora/:slug" component={BitacoraDetail} />
      {/* Direcciones v1: el camino cambia acá, el slug lo resuelve el lector. */}
      <Route path="/blog">
        <Redirect to="/bitacora" replace />
      </Route>
      <Route path="/blog/escribir" component={BlogAuthor} />
      <Route path="/blog/:slug">
        {(params) => <Redirect to={`/bitacora/${params.slug}`} replace />}
      </Route>
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
  );
}
