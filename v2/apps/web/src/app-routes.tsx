import { Redirect, Route, Switch } from 'wouter';

import {
  ApoyaAlMovimiento,
  Biblioteca,
  Bienvenida,
  Bitacora,
  BitacoraDetail,
  BlogAuthor,
  CivicAssessment,
  CoachingChat,
  Community,
  Cronica,
  DatosAbiertos,
  Desafios,
  DetallesCalculoCostoHumano,
  ElMandatoVivo,
  ElMapa,
  EnsayoDetail,
  EntrenamientoDetail,
  Entrenamientos,
  ExplorarDatos,
  ForgotPassword,
  Goals,
  Home,
  IniciativaDetail,
  IniciativaDocumento,
  InsightDashboard,
  KitDePrensa,
  LaIdea,
  Leaderboard,
  LeccionDetail,
  LifeAreaDetail,
  LifeAreasDashboard,
  Login,
  Manifiesto,
  MiPerfil,
  NotFound,
  Notifications,
  PlanDetail,
  Planes,
  PoliticaPrivacidad,
  PracticaDetail,
  PropuestaDetail,
  PulsoDetail,
  Register,
  ResetPassword,
  Sembrar,
  TwoFactorChallenge,
  VerifyEmail,
  WeeklyCheckin,
} from '~/app-pages';

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
      {/* La ruta se desarma (spec 3.6, D3): su framing lo absorbe /la-idea
          (Capítulo II); la novela tiene lector propio en /cronica. */}
      <Route path="/una-ruta-para-argentina">
        <Redirect to="/la-idea" replace />
      </Route>
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
      <Route path="/cronica" component={Cronica} />
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
      {/* Entrenamientos (3.5). Orden exigido por la spec: las rutas dinámicas
          más específicas van ANTES que el catálogo exacto. El lector de
          lección y la práctica van ARRIBA de la portada (:slug). */}
      <Route path="/entrenamientos/:slug/leccion/:n" component={LeccionDetail} />
      <Route path="/entrenamientos/:slug/practica" component={PracticaDetail} />
      <Route path="/entrenamientos/:slug" component={EntrenamientoDetail} />
      <Route path="/entrenamientos" component={Entrenamientos} />
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
