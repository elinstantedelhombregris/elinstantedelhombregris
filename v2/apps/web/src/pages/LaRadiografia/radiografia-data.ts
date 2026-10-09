import { CLASES_SENAL, escalaModular, type ClaseSenal } from '@v2/civic-core';

import type { NucleoPublico } from '~/lib/queries/radiografia';

import {
  colorDeClase as colorDeClaseDelPintor,
  GRIS_DEL_TEMA,
  type TemaDelMapa,
} from '~/components/mapa/pintor-senales';
import { CLASE_ROTULO, cuantos } from '~/lib/vocabulario';

/**
 * La Radiografía — el vocabulario visual y el recálculo en el navegador.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §3.1, §5.2, §5.6.
 *
 * **Esta página no crea ninguna tabla de color propia** (§5.2), y eso es
 * literal: acá no hay un solo hexadecimal. El color codifica la **clase** —
 * cuatro y no nueve, porque nueve colores distinguibles en AA a seis píxeles
 * no existen— y sale entero de `~/components/mapa/pintor-senales`, que es
 * donde el repo ya resolvió el problema: una regla que corre cada token hacia
 * la tinta del tema lo mínimo necesario para cruzar 3:1 contra su fondo.
 *
 * Hubo una tabla propia acá, de un solo valor por clase y sin parámetro de
 * tema, escrita mientras `civic-core/src/senal/vocabulario.ts` no existía.
 * Existe. Sobre el fondo nocturno esa tabla daba `deseo` a 1,96:1 y `meta` a
 * 2,72:1 — o sea que la primera lectura de la regla 11, «de qué clase es
 * esto», no se veía. Se borró en vez de corregirse a mano: una tercera paleta
 * escrita a mano vuelve a desincronizarse el día que cambie un token.
 */

export function esClase(valor: string): valor is ClaseSenal {
  return (CLASES_SENAL as readonly string[]).includes(valor);
}

/**
 * El color de una clase, en el tema activo. No hay versión sin tema: el mismo
 * violeta que contrasta sobre papel se hunde en el fondo nocturno, y un color
 * que no se distingue del fondo no codifica nada.
 *
 * Una clase que este código todavía no conoce se dibuja y se cuenta igual, en
 * el gris del tema — que también cruza 3:1 y hay un test que lo mide.
 */
export function colorDeClase(clase: string, tema: Tema): string {
  return esClase(clase) ? colorDeClaseDelPintor(clase, tema) : GRIS_DEL_TEMA[tema];
}

/**
 * Los nombres de las cuatro clases son los de TODO el sitio: `CLASE_ROTULO` de
 * `lib/vocabulario.ts`, los mismos que usa el mapa. Hubo acá un juego propio
 * («Hecho · Deseo · Acto · Meta») y la revisión del 9/10 encontró la misma
 * clase con dos nombres según la pantalla.
 */
export const NOMBRE_DE_CLASE: Readonly<Record<ClaseSenal, string>> = CLASE_ROTULO;

/**
 * Qué se hace con lo que dice un núcleo — regla 11, y el motivo por el que
 * esta spec existe. Converger no es corroborar: que treinta señales digan lo
 * mismo es evidencia de que treinta señales dicen lo mismo. **Treinta señales
 * no son treinta personas**: acá se cuentan filas, y una persona puede haber
 * cargado veinte.
 */
export const QUE_SE_HACE: Readonly<Record<ClaseSenal, string>> = {
  hecho: 'esto se corrobora',
  deseo: 'esto se delibera',
  acto: 'esto se cumple o no se cumple',
  meta: 'esto se mide',
};

export interface RotuloDeNucleo {
  /** `esto se delibera`, `esto se corrobora`, o el rótulo del grupo mixto. */
  rotulo: string;
  /** La composición dicha con palabras, siempre antes que el tamaño (§3.1). */
  glosa: string;
  /** La clase que pinta el núcleo. `null` cuando es mixto: no se resuelve. */
  clase: ClaseSenal | null;
  mixto: boolean;
}

/**
 * El rótulo de un núcleo, por composición y **nunca por mayoría**.
 *
 * Un núcleo es de una clase sólo si **todas** sus señales lo son. Con una
 * sola señal de otra clase adentro es mixto, y el rótulo mixto nombra las dos
 * cosas que hay que hacer en vez de elegir una. Veintinueve deseos y un hecho
 * no son «un núcleo de deseos»: son veintinueve deseos y un hecho, y el hecho
 * sigue necesitando corroboración.
 */
export function rotuloDeNucleo(clases: Readonly<Record<string, number>>): RotuloDeNucleo {
  const presentes = Object.entries(clases)
    .filter(([, cuantas]) => cuantas > 0)
    .sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1));

  // «Lo que querés: 29 · Lo que hay: 1». Con los rótulos de clase del sitio una
  // frase «29 de lo que querés» sonaba rara, y el número después del nombre se
  // lee igual que en la leyenda.
  const glosa = presentes
    .map(([clase, cuantas]) => `${etiquetaDeClase(clase)}: ${String(cuantas)}`)
    .join(' · ');

  const primera = presentes[0];
  if (!primera)
    return { rotulo: 'sin composición declarada', glosa: '', clase: null, mixto: false };

  if (presentes.length === 1 && esClase(primera[0])) {
    return { rotulo: QUE_SE_HACE[primera[0]], glosa, clase: primera[0], mixto: false };
  }

  const queHacer = presentes
    .map(([clase]) => (esClase(clase) ? QUE_SE_HACE[clase] : null))
    .filter((texto): texto is string => texto !== null);

  /*
   * Si NINGUNA de las clases presentes es conocida, el `join` de abajo devuelve
   * cadena vacía y la ficha renderiza «grupo mixto — » con la raya colgando.
   * El comentario de arriba de este archivo promete que una clase que este
   * código todavía no conoce «se dibuja y se cuenta igual»: se cuenta, pero no
   * puede prometer qué se hace con ella. Decir que no sabemos es la versión
   * honesta, y es la que no deja basura en pantalla.
   */
  if (queHacer.length === 0) {
    return { rotulo: 'clase que esta página todavía no conoce', glosa, clase: null, mixto: true };
  }

  return {
    rotulo: `grupo mixto — ${queHacer.join(', y ')}`,
    glosa,
    clase: null,
    mixto: true,
  };
}

export function etiquetaDeClase(clase: string): string {
  return esClase(clase) ? NOMBRE_DE_CLASE[clase] : clase;
}

/**
 * «412 aportes · 9 grupos · 37 sin grupo». El resumen del cielo, con el cero en
 * palabras y el plural que corresponde (nunca «1 grupos» ni un «0» suelto).
 */
export function resumenDelCielo(aportes: number, grupos: number, sinGrupo: number): string {
  const aparte = sinGrupo > 0 ? sinGrupo.toLocaleString('es-AR') : 'ninguno';
  return `${cuantos(aportes, 'aporte', 'aportes')} · ${cuantos(grupos, 'grupo', 'grupos')} · ${aparte} sin grupo`;
}

/**
 * La frase del centro de un grupo, lista para un botón: entera si entra y, si
 * no, cortada en la última palabra completa y con puntos suspensivos. Nunca se
 * parafrasea: es una frase real de alguien, y lo único que se hace es acortarla.
 */
export function fraseCorta(texto: string, maximo = 80): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (limpio.length <= maximo) return limpio;
  const ventana = limpio.slice(0, maximo - 1);
  const corte = ventana.lastIndexOf(' ');
  const base = corte > maximo * 0.5 ? ventana.slice(0, corte) : ventana;
  return `${base.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

/* ── El tema: papel o nocturno, elección del lector y persistida (R12) ───── */

/**
 * El mismo tema del pintor de señales, no uno paralelo: los dos fondos, las
 * dos tintas y los cuatro colores viven en un solo lugar, y el día que cambie
 * un token cambia para las dos superficies a la vez.
 */
export type Tema = TemaDelMapa;

const CLAVE_DE_TEMA = 'basta_radiografia_tema';

export function leerTema(): Tema {
  try {
    return window.localStorage.getItem(CLAVE_DE_TEMA) === 'nocturno' ? 'nocturno' : 'papel';
  } catch {
    // Sin storage el lector elige de nuevo cada vez. Papel es el default
    // porque es el recorrido; nocturno existe porque una constelación vive
    // en un cielo (§5.3).
    return 'papel';
  }
}

export function guardarTema(tema: Tema): void {
  try {
    window.localStorage.setItem(CLAVE_DE_TEMA, tema);
  } catch {
    /* ídem */
  }
}

/**
 * `2026-08-13T04:12:00Z` → `13 de agosto de 2026, 01:12`.
 *
 * El corte de una corrida lleva la hora, y por eso no reusa el `fechaLarga`
 * de las otras páginas: dos corridas del mismo día no son la misma corrida, y
 * quien mira esta página necesita saber cuál de las dos está viendo.
 */
export function corteLegible(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(fecha);
}

/* ── El orden de la lista, que es un control del lector y no un ranking ─── */

export type Orden = 'tamano' | 'provincias' | 'distancia';

export const ORDENES: readonly { valor: Orden; etiqueta: string }[] = [
  { valor: 'tamano', etiqueta: 'Tamaño' },
  { valor: 'provincias', etiqueta: 'Provincias' },
  { valor: 'distancia', etiqueta: 'Distancia' },
];

/**
 * Un núcleo como lo ve la pantalla. La única diferencia con el del contrato
 * es que `provincias` puede no saberse: el navegador sabe recalcular quién
 * está con quién, y no sabe de dónde es nadie. Un `0` ahí sería una
 * afirmación falsa; `null` es «no lo sé todavía» y se dibuja como raya.
 */
export interface NucleoEnPantalla extends Omit<NucleoPublico, 'provincias'> {
  provincias: number | null;
}

export function ordenarNucleos<T extends NucleoEnPantalla>(
  nucleos: readonly T[],
  orden: Orden,
): T[] {
  const clave = (n: T): number => {
    if (orden === 'provincias') return n.provincias ?? -1;
    if (orden === 'distancia') return n.distancia?.km ?? -1;
    return n.senales;
  };
  // Desempate por id: dos núcleos con la misma métrica no pueden alternar de
  // fila entre renders o la lista parpadearía sin que cambie el dato.
  return [...nucleos].sort((p, q) => clave(q) - clave(p) || (p.id < q.id ? -1 : 1));
}

/**
 * El radio de un nodo por el tamaño de su núcleo, en la escala modular φ
 * (1 · 1,618 · 2,618 · 4,236 — §5.6.3). φ acá es presentación y nada más: no
 * toca el umbral, ni el conteo, ni una distancia publicada (R10).
 */
export function radioDeNodo(senalesDelNucleo: number): number {
  if (senalesDelNucleo >= 21) return escalaModular(3);
  if (senalesDelNucleo >= 8) return escalaModular(2);
  if (senalesDelNucleo >= 2) return escalaModular(1);
  return escalaModular(0);
}

/* ── Porcentajes de respuestas: sin decimales cuando son pocas ─────────── */

/**
 * Con menos respuestas que esto, un porcentaje con decimales miente precisión:
 * 3 de 5 es «60 %», no «60,0 %», y se avisa que son pocas respuestas.
 */
export const RESPUESTAS_MINIMAS_PARA_DECIMALES = 30;

/**
 * «60 %» o «60,0 %», con coma decimal también para el lector de pantalla.
 * Se formatea una sola vez y se usa en la vista y en el `aria-label`: antes la
 * vista decía «60,0» y el lector «60.0».
 */
export function porcentajeDe(parte: number, total: number): string {
  if (total <= 0) return '—';
  const valor = (parte * 100) / total;
  const conDecimales = total >= RESPUESTAS_MINIMAS_PARA_DECIMALES;
  return `${valor.toLocaleString('es-AR', {
    minimumFractionDigits: conDecimales ? 1 : 0,
    maximumFractionDigits: conDecimales ? 1 : 0,
  })} %`;
}
