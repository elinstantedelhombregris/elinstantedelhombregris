/**
 * Repository barrel.
 *
 * One repository per domain (users, auth, blog, community, ...).
 * They take a `Db` in the constructor so test code can inject a
 * test branch's client.
 */
export { UsersRepository } from './users.js';
export { AuthRepository } from './auth.js';
export { NotificationsRepository } from './notifications.js';
export {
  GeographicRepository,
  normalizeProvinceName,
  NIVELES_DE_LOCALIDAD,
  NIVELES_DE_LUGAR,
} from './geographic.js';
export type {
  Ancestros,
  BusquedaDeLocalidad,
  FiltroDeLugares,
  NivelDeLugar,
} from './geographic.js';
export type { OpcionesDeLectura } from './_lectura.js';
export {
  COLUMNAS_DEL_PAQUETE,
  GeoCallesRepository,
  LIMITE_MAXIMO,
  LIMITE_POR_DEFECTO,
  MINIMO_DE_CONSULTA,
} from './geo-calles.js';
export type {
  AmbitoDeBusqueda,
  BusquedaDeCalles,
  CalleDelCatalogo,
  CalleParaSembrar,
  ClaseDeNombre,
  ConsultaDeCalles,
  FilaDePaquete,
  LugarNombrado,
  PaqueteDeCalles,
  ResultadoDeLote,
  ScopeDeBusqueda,
} from './geo-calles.js';
export { CommunityRepository } from './community.js';
export { BlogRepository } from './blog.js';
export { EnsayosRepository } from './ensayos.js';
export { CivicAssessmentRepository } from './civic-assessment.js';
export { GoalsRepository } from './goals.js';
export { CoachingRepository } from './coaching.js';
export { ResourcesRepository } from './resources.js';
export { DreamsRepository } from './dreams.js';
export { CivicMapRepository, CAPAS_MAPA } from './civic-map.js';
export type { CapaMapa, SenalMapa, BBox, ConsultaSenales } from './civic-map.js';
export { FeedbackRepository } from './feedback.js';
export { CoursesRepository } from './courses.js';
export { IniciativasRepository } from './iniciativas.js';
export { MandatoRepository } from './mandato.js';
export { PulsoRepository } from './pulso.js';
export { GamificationRepository } from './gamification.js';
export { LifeAreasRepository } from './life-areas.js';
export { SemillasRepository } from './semillas.js';
