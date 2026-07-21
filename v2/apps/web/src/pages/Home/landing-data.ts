import { PLAN_REGISTRY } from '~/lib/plans-registry';

/**
 * Datos de la landing «Papel y Tinta».
 *
 * Las voces, semillas y círculos son DATOS DE DEMOSTRACIÓN (la plataforma
 * real arranca en cero) y llevan asterisco en la UI, como exige el sistema
 * de diseño. Los planes son reales: salen de PLAN_REGISTRY (MDX).
 */

export type TipoVoz = 'basta' | 'sueño' | 'necesidad' | 'compromiso' | 'recurso' | 'valor';

export interface VozDemo {
  tipo: TipoVoz;
  texto: string;
  lugar: string;
}

export const DEMO_VOCES: readonly VozDemo[] = [
  { tipo: 'basta', texto: 'Basta de rutas sin luz donde ya murió gente.', lugar: 'Trelew, Chubut' },
  {
    tipo: 'sueño',
    texto: 'Que mi hija pueda estudiar sin tener que irse del pueblo.',
    lugar: 'Tafí del Valle, Tucumán',
  },
  {
    tipo: 'necesidad',
    texto: 'Un centro de salud que abra los sábados en el barrio.',
    lugar: 'Quilmes, Buenos Aires',
  },
  {
    tipo: 'compromiso',
    texto: 'Doy apoyo escolar gratis los martes. Empiezo este mes.',
    lugar: 'Rosario, Santa Fe',
  },
  {
    tipo: 'recurso',
    texto: 'Tengo camioneta y tiempo los fines de semana.',
    lugar: 'Salta capital',
  },
  {
    tipo: 'valor',
    texto: 'La salud y la educación no se negocian. Nunca.',
    lugar: 'La Plata, Buenos Aires',
  },
  {
    tipo: 'sueño',
    texto: 'Un tren que vuelva a parar en mi estación.',
    lugar: 'Laboulaye, Córdoba',
  },
  {
    tipo: 'basta',
    texto: 'Basta de decidir entre remedios y comida.',
    lugar: 'Paraná, Entre Ríos',
  },
  {
    tipo: 'necesidad',
    texto: 'Agua potable de verdad, no de bidón.',
    lugar: 'Añatuya, Santiago del Estero',
  },
  {
    tipo: 'compromiso',
    texto: 'Abro mi taller para enseñar oficio a 5 pibes.',
    lugar: 'Neuquén capital',
  },
  {
    tipo: 'sueño',
    texto: 'Quedarme. Simplemente poder quedarme.',
    lugar: 'Ushuaia, Tierra del Fuego',
  },
  {
    tipo: 'valor',
    texto: 'El que ejecuta plata pública rinde cuentas en público.',
    lugar: 'Mendoza capital',
  },
  { tipo: 'basta', texto: 'Basta de escuelas donde llueve adentro.', lugar: 'Resistencia, Chaco' },
  {
    tipo: 'recurso',
    texto: 'Soy contadora, audito gratis el club del barrio.',
    lugar: 'Mar del Plata',
  },
];

export interface TresLineasRow {
  num: string;
  a: string;
  b: string;
  def: string;
}

export const TRES_LINEAS: readonly TresLineasRow[] = [
  {
    num: '01',
    a: 'La ciudadanía',
    b: 'diseña.',
    def: 'Vos decís qué país querés — en el mapa, con tu voz. Nadie interpreta por vos.',
  },
  {
    num: '02',
    a: 'El Estado',
    b: 'administra.',
    def: 'Técnicos que gestionan lo diseñado. Gerentes, no dueños.',
  },
  {
    num: '03',
    a: 'La política',
    b: 'ejecuta.',
    def: 'El que quiera un cargo firma el mandato ciudadano. Y rinde cuentas en público.',
  },
];

/** Planes reales (sin PLANRUTA, que es meta) ordenados por orderIndex. */
export const PLANES_REALES = PLAN_REGISTRY.filter((p) => !p.isMeta);

export const PLAN_COUNT = PLANES_REALES.length;

/** Los tres planes destacados del teaser. */
export const PLANES_TEASER = PLANES_REALES.slice(0, 3);

export interface Cifra {
  n: string;
  label: string;
  href: string;
  esVioleta?: boolean;
  esDemo: boolean;
}

export const CIFRAS: readonly Cifra[] = [
  { n: '12.496', label: 'voces en el mapa', href: '/el-mapa', esDemo: true },
  { n: '3.107', label: 'semillas plantadas', href: '/la-semilla-de-basta', esDemo: true },
  { n: '214', label: 'círculos activos', href: '/comunidad', esDemo: true },
  {
    n: String(PLAN_COUNT),
    label: 'planes en la prueba',
    href: '/planes',
    esVioleta: true,
    esDemo: false,
  },
];

export interface Tally {
  alto: number;
  rot: number;
  color: string;
}

/** Palitos de la banda del hombre gris — pseudo-aleatorio determinista del diseño. */
export const TALLIES: readonly Tally[] = Array.from({ length: 72 }, (_, i) => ({
  alto: 22 + ((i * 7) % 16),
  rot: ((i * 13) % 11) - 5,
  color: i === 47 ? '#5227CC' : i % 9 === 0 ? '#F2EFE7' : '#6B675E',
}));
