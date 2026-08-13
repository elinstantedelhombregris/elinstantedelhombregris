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
  FaltaDetail,
  ForgotPassword,
  Goals,
  Home,
  IniciativaDetail,
  IniciativaDocumento,
  InsightDashboard,
  KitDePrensa,
  LaIdea,
  LaRadiografia,
  Leaderboard,
  LeccionDetail,
  LifeAreaDetail,
  LifeAreasDashboard,
  Login,
  LoQueFalta,
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
  QuienEstaDetras,
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
      {/* Entrada única desde la franja inferior del footer — nunca desde el
          header ni el recorrido (spec 2026-08-10-quien-esta-detras.md). */}
      <Route path="/quien-esta-detras" component={QuienEstaDetras} />

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
      {/* La cuarta superficie: página propia y no una sexta lente del mapa
          (spec 2026-08-12-la-radiografia.md §12, y la respuesta a su pregunta
          abierta 4 — el nombre viene de la constitución de producto). */}
      <Route path="/la-radiografia" component={LaRadiografia} />
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
      {/* /explorar-datos era un scaffold sin convertir a Papel y Tinta, con un
          maplibre de marcadores en centroides y un formulario de carga
          duplicado. El análisis vive ahora en la misma página que convierte
          (D1 de la spec paraguas del mapa territorial). */}
      <Route path="/explorar-datos">
        <Redirect to="/el-mapa#instrumento" replace />
      </Route>
      <Route path="/datos-abiertos" component={DatosAbiertos} />
      <Route path="/tablero" component={InsightDashboard} />

      {/* Canal de escucha (spec 2026-08-12-lo-que-falta.md). La ficha va ANTES
          que el registro: `/lo-que-falta/:idPublico` tiene que ganarle a la
          portada, y es la URL que vuelve en el recibo de cada envío. */}
      <Route path="/lo-que-falta/:idPublico" component={FaltaDetail} />
      <Route path="/lo-que-falta" component={LoQueFalta} />

      <Route component={NotFound} />
    </Switch>
  );
}
