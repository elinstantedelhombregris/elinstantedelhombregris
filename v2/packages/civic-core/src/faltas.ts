/**
 * Lo que falta — el vocabulario y la máquina de estados del canal de escucha.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md` §2.3.
 *
 * **Por qué acá y no en la ruta.** La regla que hace que este canal signifique
 * algo es una sola: *el `no_va` lleva razón escrita, o no se guarda*. Si esa
 * regla vive en el `PATCH`, vive en un lugar donde para probarla hay que
 * levantar Express y una base; y el día que haya una segunda boca —un script
 * de mantenimiento, la app de campo, un cierre en lote desde el importador—
 * la regla se reimplementa o se olvida. Acá es una función pura que se
 * ejercita sin red y sin disco, y las bocas la llaman.
 *
 * Módulo puro: sin red, sin disco, sin reloj — como todo `civic-core`.
 */

/** De dónde vino la falta. Determina el prefijo del id público y la severidad. */
export const ORIGENES_DE_FALTA = ['adentro', 'afuera'] as const;
export type OrigenDeFalta = (typeof ORIGENES_DE_FALTA)[number];

/** Qué parte de la plataforma es la que falla o la que podría mejorar. */
export const SUPERFICIES_DE_FALTA = [
  'el-mapa',
  'los-planes',
  'la-biblioteca',
  'los-entrenamientos',
  'la-plataforma',
] as const;
export type SuperficieDeFalta = (typeof SUPERFICIES_DE_FALTA)[number];

/**
 * La severidad la califica quien lleva el registro, no quien deja la idea.
 * Nadie juzga desde afuera la gravedad de lo suyo — eso es un juicio, y el
 * juicio es de quien sostiene el sistema. Ver `severidadValida()`.
 */
export const SEVERIDADES_DE_FALTA = ['bloqueante', 'alta', 'media', 'baja'] as const;
export type SeveridadDeFalta = (typeof SEVERIDADES_DE_FALTA)[number];

export const ESTADOS_DE_FALTA = [
  'dicha',
  'anotada',
  'en_curso',
  'hecha',
  'no_va',
  'bajada',
] as const;
export type EstadoDeFalta = (typeof ESTADOS_DE_FALTA)[number];

/** Estados desde los que ya no se sale. `bajada` incluida: bajar es definitivo. */
export const ESTADOS_TERMINALES: readonly EstadoDeFalta[] = ['hecha', 'no_va', 'bajada'];

/**
 * Las transiciones permitidas, sin contar `bajada`, que se alcanza desde
 * cualquier estado no terminal (§2.3) y por eso no figura acá.
 */
const TRANSICIONES: Readonly<Record<EstadoDeFalta, readonly EstadoDeFalta[]>> = {
  dicha: ['anotada', 'no_va'],
  anotada: ['en_curso', 'no_va'],
  en_curso: ['hecha', 'no_va'],
  hecha: [],
  no_va: [],
  bajada: [],
};

/** Estados que no se guardan sin una razón escrita. */
const EXIGEN_RAZON: readonly EstadoDeFalta[] = ['no_va', 'bajada'];

/** Estados en los que el contenido deja de ser público (§2.2). */
const VACIAN_CONTENIDO: readonly EstadoDeFalta[] = ['bajada'];

export interface PatchDeFalta {
  /** Obligatoria para `no_va` y `bajada`. */
  readonly razon?: string | undefined;
  /** El `D-0NN` que le tocó en `docs/DEUDAS.md` cuando una idea se acepta. */
  readonly anotadaComo?: string | undefined;
  /** Commit o entrada de Bitácora. */
  readonly cierreUrl?: string | undefined;
}

export type ResultadoDeTransicion =
  | { readonly ok: true }
  | { readonly ok: false; readonly codigo: CodigoDeRechazo; readonly mensaje: string };

export type CodigoDeRechazo =
  | 'ESTADO_DESCONOCIDO'
  | 'TRANSICION_INVALIDA'
  | 'YA_ES_TERMINAL'
  | 'RAZON_REQUERIDA';

export function esEstadoDeFalta(valor: unknown): valor is EstadoDeFalta {
  return typeof valor === 'string' && (ESTADOS_DE_FALTA as readonly string[]).includes(valor);
}

export function esOrigenDeFalta(valor: unknown): valor is OrigenDeFalta {
  return typeof valor === 'string' && (ORIGENES_DE_FALTA as readonly string[]).includes(valor);
}

export function esSuperficieDeFalta(valor: unknown): valor is SuperficieDeFalta {
  return typeof valor === 'string' && (SUPERFICIES_DE_FALTA as readonly string[]).includes(valor);
}

export function esSeveridadDeFalta(valor: unknown): valor is SeveridadDeFalta {
  return typeof valor === 'string' && (SEVERIDADES_DE_FALTA as readonly string[]).includes(valor);
}

/** `true` si el estado no admite ninguna salida. */
export function esTerminal(estado: EstadoDeFalta): boolean {
  return ESTADOS_TERMINALES.includes(estado);
}

/** `true` si al entrar a este estado hay que vaciar título y cuerpo. */
export function vaciaContenido(estado: EstadoDeFalta): boolean {
  return VACIAN_CONTENIDO.includes(estado);
}

/**
 * Sólo las faltas de adentro llevan severidad (§3.1). El CHECK cruzado de la
 * tabla impone lo mismo; esta función es la que puede decir *por qué* antes de
 * que la base tire un error opaco.
 */
export function severidadValida(origen: OrigenDeFalta, severidad: unknown): boolean {
  if (severidad === undefined || severidad === null) return true;
  return origen === 'adentro' && esSeveridadDeFalta(severidad);
}

/**
 * La única regla del canal, escrita una vez.
 *
 * Rechaza —en este orden— el estado que no existe, la salida desde un estado
 * terminal, la transición que el grafo no tiene, y el `no_va` o el `bajada`
 * sin razón escrita. El orden importa para el mensaje: quien pide pasar de
 * `hecha` a `en_curso` tiene que leer «ya está cerrada», no «no existe esa
 * transición», que es cierto pero no explica nada.
 */
export function transicionValida(
  desde: EstadoDeFalta,
  hacia: EstadoDeFalta,
  patch: PatchDeFalta = {},
): ResultadoDeTransicion {
  if (!esEstadoDeFalta(desde) || !esEstadoDeFalta(hacia)) {
    return {
      ok: false,
      codigo: 'ESTADO_DESCONOCIDO',
      mensaje: 'Ese estado no existe.',
    };
  }

  if (desde === hacia) {
    return {
      ok: false,
      codigo: 'TRANSICION_INVALIDA',
      mensaje: `La falta ya está en «${hacia}».`,
    };
  }

  if (esTerminal(desde)) {
    return {
      ok: false,
      codigo: 'YA_ES_TERMINAL',
      mensaje: `Una falta en «${desde}» ya está cerrada y no se mueve más.`,
    };
  }

  // `bajada` se alcanza desde cualquier estado no terminal: bajar contenido no
  // puede depender de dónde estaba la falta en el recorrido.
  const permitidas = hacia === 'bajada' ? [...TRANSICIONES[desde], 'bajada'] : TRANSICIONES[desde];
  if (!permitidas.includes(hacia)) {
    return {
      ok: false,
      codigo: 'TRANSICION_INVALIDA',
      mensaje: `No se puede pasar de «${desde}» a «${hacia}».`,
    };
  }

  if (EXIGEN_RAZON.includes(hacia) && (patch.razon ?? '').trim().length === 0) {
    return {
      ok: false,
      codigo: 'RAZON_REQUERIDA',
      mensaje:
        hacia === 'no_va'
          ? 'Un «no va» sin razón escrita no se guarda. Decí por qué.'
          : 'Bajar una falta exige dejar el motivo.',
    };
  }

  return { ok: true };
}

/** Prefijo del id público según el origen: `D-034` adentro, `I-007` afuera. */
export function prefijoDeOrigen(origen: OrigenDeFalta): 'D' | 'I' {
  return origen === 'adentro' ? 'D' : 'I';
}

/** `I-7` → `I-007`. La numeración se lee como la de `docs/DEUDAS.md`. */
export function idPublicoDeFalta(origen: OrigenDeFalta, numero: number): string {
  if (!Number.isInteger(numero) || numero < 1) {
    throw new RangeError(`Número de falta inválido: ${numero}`);
  }
  return `${prefijoDeOrigen(origen)}-${String(numero).padStart(3, '0')}`;
}

/** El inverso, tolerante con el ancho: acepta `D-34` y `D-034`. */
export function leerIdPublico(
  idPublico: string,
): { origen: OrigenDeFalta; numero: number } | undefined {
  const match = /^([DI])-(\d{1,6})$/.exec(idPublico.trim().toUpperCase());
  if (!match?.[1] || !match[2]) return undefined;
  const numero = Number.parseInt(match[2], 10);
  if (numero < 1) return undefined;
  return { origen: match[1] === 'D' ? 'adentro' : 'afuera', numero };
}
