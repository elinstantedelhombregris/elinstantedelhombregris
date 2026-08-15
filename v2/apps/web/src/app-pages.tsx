import { lazy } from 'react';

/**
 * Tabla de páginas perezosas. Vive separada de `app-routes.tsx` para que
 * ninguno de los dos archivos pase el tope de 300 LOC de v2/CLAUDE.md: el
 * router crece con cada ruta nueva y la tabla con cada página nueva.
 */

// Lazy-load every page so each route ships its own chunk.
export const Home = lazy(async () => {
  const m = await import('~/pages/Home');
  return { default: m.Home };
});
export const NotFound = lazy(async () => {
  const m = await import('~/pages/NotFound');
  return { default: m.NotFound };
});
export const Login = lazy(async () => {
  const m = await import('~/pages/Login');
  return { default: m.Login };
});
export const Register = lazy(async () => {
  const m = await import('~/pages/Register');
  return { default: m.Register };
});
export const ForgotPassword = lazy(async () => {
  const m = await import('~/pages/ForgotPassword');
  return { default: m.ForgotPassword };
});
export const ResetPassword = lazy(async () => {
  const m = await import('~/pages/ResetPassword');
  return { default: m.ResetPassword };
});
export const VerifyEmail = lazy(async () => {
  const m = await import('~/pages/VerifyEmail');
  return { default: m.VerifyEmail };
});
export const TwoFactorChallenge = lazy(async () => {
  const m = await import('~/pages/TwoFactorChallenge');
  return { default: m.TwoFactorChallenge };
});
export const Manifiesto = lazy(async () => {
  const m = await import('~/pages/Manifiesto');
  return { default: m.Manifiesto };
});
export const LaIdea = lazy(async () => {
  const m = await import('~/pages/LaIdea');
  return { default: m.LaIdea };
});
export const QuienEstaDetras = lazy(async () => {
  const m = await import('~/pages/QuienEstaDetras');
  return { default: m.QuienEstaDetras };
});
export const Sembrar = lazy(async () => {
  const m = await import('~/pages/Sembrar');
  return { default: m.Sembrar };
});
export const LoQueFalta = lazy(async () => {
  const m = await import('~/pages/LoQueFalta');
  return { default: m.LoQueFalta };
});
export const FaltaDetail = lazy(async () => {
  const m = await import('~/pages/FaltaDetail');
  return { default: m.FaltaDetail };
});
export const ElMapa = lazy(async () => {
  const m = await import('~/pages/ElMapa');
  return { default: m.ElMapa };
});
/**
 * La cuarta superficie (`docs/specs/2026-08-12-la-radiografia.md`). Chunk
 * propio como todas: la constelación es canvas-2D sin dependencias, así que
 * lo único que se difiere acá es su propio código.
 */
export const LaRadiografia = lazy(async () => {
  const m = await import('~/pages/LaRadiografia');
  return { default: m.LaRadiografia };
});
/**
 * La Simulación — un módulo con dos modos (spec 2026-08-13). Chunk propio, y
 * conviene que lo sea: se lleva el motor entero de `civic-core/simulacion` y el
 * worker del barrido, que nadie necesita para leer la portada.
 */
/**
 * La página de una señal. Es lo que hace que una voz pueda circular: un link
 * para mandarle a un vecino, y la única superficie donde se puede adherir o
 * poner el segundo par de ojos.
 */
export const Senal = lazy(async () => {
  const m = await import('~/pages/Senal');
  return { default: m.Senal };
});

export const LaSimulacion = lazy(async () => {
  const m = await import('~/pages/LaSimulacion');
  return { default: m.LaSimulacion };
});
export const DetallesCalculoCostoHumano = lazy(async () => {
  const m = await import('~/pages/DetallesCalculoCostoHumano');
  return { default: m.DetallesCalculoCostoHumano };
});
export const KitDePrensa = lazy(async () => {
  const m = await import('~/pages/KitDePrensa');
  return { default: m.KitDePrensa };
});
export const Planes = lazy(async () => {
  const m = await import('~/pages/Planes');
  return { default: m.Planes };
});
export const PlanDetail = lazy(async () => {
  const m = await import('~/pages/PlanDetail');
  return { default: m.PlanDetail };
});
export const LifeAreasDashboard = lazy(async () => {
  const m = await import('~/pages/LifeAreasDashboard');
  return { default: m.LifeAreasDashboard };
});
export const LifeAreaDetail = lazy(async () => {
  const m = await import('~/pages/LifeAreaDetail');
  return { default: m.LifeAreaDetail };
});
export const CivicAssessment = lazy(async () => {
  const m = await import('~/pages/CivicAssessment');
  return { default: m.CivicAssessment };
});
export const Goals = lazy(async () => {
  const m = await import('~/pages/Goals');
  return { default: m.Goals };
});
export const CoachingChat = lazy(async () => {
  const m = await import('~/pages/CoachingChat');
  return { default: m.CoachingChat };
});
export const Biblioteca = lazy(async () => {
  const m = await import('~/pages/Biblioteca');
  return { default: m.Biblioteca };
});
export const EnsayoDetail = lazy(async () => {
  const m = await import('~/pages/EnsayoDetail');
  return { default: m.EnsayoDetail };
});
export const Bitacora = lazy(async () => {
  const m = await import('~/pages/Bitacora');
  return { default: m.Bitacora };
});
export const BitacoraDetail = lazy(async () => {
  const m = await import('~/pages/BitacoraDetail');
  return { default: m.BitacoraDetail };
});
export const Entrenamientos = lazy(async () => {
  const m = await import('~/pages/Entrenamientos');
  return { default: m.Entrenamientos };
});
export const EntrenamientoDetail = lazy(async () => {
  const m = await import('~/pages/EntrenamientoDetail');
  return { default: m.EntrenamientoDetail };
});
export const LeccionDetail = lazy(async () => {
  const m = await import('~/pages/LeccionDetail');
  return { default: m.LeccionDetail };
});
export const PracticaDetail = lazy(async () => {
  const m = await import('~/pages/PracticaDetail');
  return { default: m.PracticaDetail };
});
export const Community = lazy(async () => {
  const m = await import('~/pages/Community');
  return { default: m.Community };
});
export const Cronica = lazy(async () => {
  const m = await import('~/pages/Cronica');
  return { default: m.Cronica };
});
export const Notifications = lazy(async () => {
  const m = await import('~/pages/Notifications');
  return { default: m.Notifications };
});
export const WeeklyCheckin = lazy(async () => {
  const m = await import('~/pages/WeeklyCheckin');
  return { default: m.WeeklyCheckin };
});
export const ElMandatoVivo = lazy(async () => {
  const m = await import('~/pages/ElMandatoVivo');
  return { default: m.ElMandatoVivo };
});
export const BlogAuthor = lazy(async () => {
  const m = await import('~/pages/BlogAuthor');
  return { default: m.BlogAuthor };
});
export const DatosAbiertos = lazy(async () => {
  const m = await import('~/pages/DatosAbiertos');
  return { default: m.DatosAbiertos };
});
export const InsightDashboard = lazy(async () => {
  const m = await import('~/pages/InsightDashboard');
  return { default: m.InsightDashboard };
});
export const MiPerfil = lazy(async () => {
  const m = await import('~/pages/MiPerfil');
  return { default: m.MiPerfil };
});
export const Leaderboard = lazy(async () => {
  const m = await import('~/pages/Leaderboard');
  return { default: m.Leaderboard };
});
export const Desafios = lazy(async () => {
  const m = await import('~/pages/Desafios');
  return { default: m.Desafios };
});
export const IniciativaDetail = lazy(async () => {
  const m = await import('~/pages/IniciativaDetail');
  return { default: m.IniciativaDetail };
});
export const IniciativaDocumento = lazy(async () => {
  const m = await import('~/pages/IniciativaDocumento');
  return { default: m.IniciativaDocumento };
});
export const PulsoDetail = lazy(async () => {
  const m = await import('~/pages/PulsoDetail');
  return { default: m.PulsoDetail };
});
export const PropuestaDetail = lazy(async () => {
  const m = await import('~/pages/PropuestaDetail');
  return { default: m.PropuestaDetail };
});
export const Bienvenida = lazy(async () => {
  const m = await import('~/pages/Bienvenida');
  return { default: m.Bienvenida };
});
export const ApoyaAlMovimiento = lazy(async () => {
  const m = await import('~/pages/ApoyaAlMovimiento');
  return { default: m.ApoyaAlMovimiento };
});
export const PoliticaPrivacidad = lazy(async () => {
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
