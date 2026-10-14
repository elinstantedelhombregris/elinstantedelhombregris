import { fechaCampana } from '../Campanas/presentacion';

import type { ContenidoFicha, DisenoFicha } from '@v2/shared';

export type RelacionFicha = ContenidoFicha['vinculos'][number]['relacion'];
export type EstadoPrueba = DisenoFicha['pruebas'][number]['estado'];

/** Lo que una ficha es, dicho una vez y con las mismas palabras donde aparezca. */
export const LEAD_FICHA =
  'Una ficha es una propuesta para discutir, no un acuerdo ni una decisión. La puede leer cualquiera; la edita quien la creó y su equipo.';

export const etiquetaVersion = (version: number) => `Ficha abierta · versión ${version}`;

/** Cómo se relaciona un aporte con la ficha. Única fuente: nadie muestra la clave cruda. */
export const RELACIONES: Record<RelacionFicha, string> = {
  describe: 'Describe la situación',
  contradice: 'Contradice la lectura',
  evidencia: 'Aporta evidencia',
  capacidad: 'Aporta una capacidad',
  inspira: 'Inspira el futuro deseado',
};
/** Un aporte que se vincula sin elegir nada inspira: nunca se etiqueta una aspiración como descripción. */
export const RELACION_INICIAL: RelacionFicha = 'inspira';

export function esRelacion(valor: string): valor is RelacionFicha {
  return Object.keys(RELACIONES).includes(valor);
}

/**
 * Los pasos de una prueba, en palabras que se entienden sin conocer el modelo.
 * Exportado para que otras pantallas que muestran pruebas (Mandato vivo) adopten
 * las mismas palabras.
 */
export const ESTADOS_PRUEBA: Record<EstadoPrueba, string> = {
  propuesta: 'Prueba propuesta',
  aceptada: 'Responsabilidad aceptada',
  en_curso: 'En curso',
  pausada: 'Pausada',
  implementada: 'Implementación declarada',
  resultado_observado: 'Resultado observado',
  resultado_revisado: 'Revisión por otra cuenta registrada',
};

export function rotuloDePrueba(estado: string): string {
  return (
    Object.entries(ESTADOS_PRUEBA).find(([clave]) => clave === estado)?.[1] ?? 'Paso sin nombre'
  );
}

/** Los campos que el historial de una ficha menciona, con el nombre que ve quien lee. */
const CAMPOS_DE_LA_FICHA: Readonly<Record<string, string>> = {
  creación: 'creación de la ficha',
  titulo: 'título',
  territorioId: 'lugar',
  temas: 'temas',
  situacion: 'situación actual',
  futuro: 'futuro deseado',
  proximaTarea: 'próxima tarea',
  campanaId: 'campaña',
  condiciones: 'condiciones',
  vinculos: 'vínculos',
  cuaderno: 'evidencia y objetivos',
  proceso: 'reglas y participación',
  sintesis: 'síntesis',
};

export function nombreDeCampo(clave: string): string {
  return CAMPOS_DE_LA_FICHA[clave] ?? 'otro campo';
}

function dosDigitos(n: number) {
  return String(n).padStart(2, '0');
}

/** Una fecha con hora (ISO) como día en castellano, en la zona de quien lee. */
export function fechaDeFicha(iso: string): string {
  const valor = new Date(iso);
  if (Number.isNaN(valor.getTime())) return iso;
  return fechaCampana(
    `${valor.getFullYear()}-${dosDigitos(valor.getMonth() + 1)}-${dosDigitos(valor.getDate())}`,
  );
}

/** `1 ficha`, `12 fichas`; con `ninguno`, el cero se dice en palabras: «ninguna ficha». */
export function cantidadDe(n: number, uno: string, varios: string, ninguno?: string): string {
  if (n === 0 && ninguno) return ninguno;
  return `${n} ${n === 1 ? uno : varios}`;
}

/** Por qué un texto todavía no alcanza, o `null` cuando alcanza. */
export function faltanCaracteres(escritos: number, minimo: number, en?: string): string | null {
  const faltan = minimo - escritos;
  if (faltan <= 0) return null;
  const donde = en ? ` ${en}` : '';
  return faltan === 1 ? `Falta 1 carácter${donde}.` : `Faltan ${faltan} caracteres${donde}.`;
}

/** Los tres tramos de la conversación sobre una ficha: la pestaña y el título son la misma frase. */
export const VISTAS_DE_DISENO = ['afirmaciones', 'alternativas', 'pruebas'] as const;
export type VistaDeDiseno = (typeof VISTAS_DE_DISENO)[number];
export const TITULOS_DE_DISENO: Record<VistaDeDiseno, string> = {
  afirmaciones: 'Afirmaciones para conversar',
  alternativas: 'Alternativas para comparar',
  pruebas: 'Pruebas chicas para aprender',
};
export function leerVista(valor: string | null): VistaDeDiseno {
  return VISTAS_DE_DISENO.find((v) => v === valor) ?? 'afirmaciones';
}

/** `ab, cd y ef`. */
export function enLista(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1] ?? ''}`;
}

const FORMA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const esUuid = (valor: string | null | undefined): valor is string =>
  typeof valor === 'string' && FORMA_UUID.test(valor);

/** El `?lugar=` de la dirección: un entero positivo o nada. */
export function numeroDeLugar(valor: string | null): number | undefined {
  const n = Number(valor);
  return valor !== null && Number.isSafeInteger(n) && n > 0 ? n : undefined;
}
