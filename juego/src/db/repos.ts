/**
 * Repos — helpers tipados de lectura/escritura que usan las pantallas.
 *
 * Acá vive la cáscara impura (reloj, uuids, SQLite); las reglas viven en
 * `src/game/` y se invocan desde acá. API sincrónica de drizzle/expo-sqlite
 * (.all/.get/.run): simple y suficiente para una DB local de una persona.
 */

import { and, asc, eq } from 'drizzle-orm';
import {
  COSTOS,
  GANANCIAS,
  MOTIVOS,
  balance,
  crearGanancia,
  crearGasto,
  motivoDeLuz,
  totalGanado,
} from '../game/brasas';
import {
  BRASAS_POR_HITO,
  MOTIVO_POR_HITO,
  hitosCruzados,
  progresoExpedicion,
} from '../game/expediciones';
import { addDias, computeRacha } from '../game/racha';
import { calcularRarezas } from '../game/rarezas';
import type {
  EmberEntry,
  Luz,
  OrigenExpedicion,
  RachaEstado,
  TipoEstrella,
  TipoUnlock,
} from '../game/types';
import { db } from './client';
import {
  commitments,
  days,
  emberLedger,
  expeditionEntries,
  expeditions,
  redeemedNonces,
  reflections,
  settings,
  stars,
  unlocks,
} from './schema';
import type {
  CommitmentRow,
  DayRow,
  ExpeditionEntryRow,
  ExpeditionRow,
  ReflectionRow,
  StarRow,
  UnlockRow,
} from './schema';

// ---------------------------------------------------------------------------
// Cáscara impura: ids y reloj (lo único que no va en src/game)
// ---------------------------------------------------------------------------

/** UUID v4 — usa crypto.randomUUID si existe (Hermes moderno), si no lo arma. */
export const nuevoId = (): string => {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const pad = (n: number): string => String(n).padStart(2, '0');

/** Fecha local del dispositivo, YYYY-MM-DD (la Argentina vive en local time). */
export const hoyLocal = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Timestamp ISO 8601 (UTC) para createdAt y ledger. */
export const ahoraISO = (): string => new Date().toISOString();

/** Hora local 0-23 (para el flag nocturna). */
export const horaLocal = (): number => new Date().getHours();

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** Claves conocidas de settings. */
export const CLAVES = {
  ritoFecha: 'rito_fecha',
  paletaActiva: 'paleta_activa',
  ftueCompleto: 'ftue_completo',
  eventoVistoFecha: 'evento_visto_fecha',
} as const;

export const getSetting = (key: string): string | null =>
  db.select().from(settings).where(eq(settings.key, key)).get()?.value ?? null;

export const setSetting = (key: string, value: string): void => {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
};

// ---------------------------------------------------------------------------
// Brasas (ledger append-only)
// ---------------------------------------------------------------------------

export const ledgerTodo = (): EmberEntry[] =>
  db.select().from(emberLedger).orderBy(asc(emberLedger.fecha)).all();

export const brasasBalance = (): number => balance(ledgerTodo());

/** Total histórico ganado — mueve los rangos (spec §3.3). */
export const brasasTotalGanado = (): number => totalGanado(ledgerTodo());

export interface OpcionesBrasas {
  /** 2 en día de brasas x2 (evento fugaz). */
  multiplicador?: 1 | 2;
  fecha?: string;
}

/** Registra una ganancia y devuelve la entrada insertada. */
export const ganarBrasas = (
  delta: number,
  motivo: string,
  opts: OpcionesBrasas = {},
): EmberEntry => {
  const entry = crearGanancia({
    id: nuevoId(),
    delta,
    motivo,
    fecha: opts.fecha ?? ahoraISO(),
    multiplicador: opts.multiplicador ?? 1,
  });
  db.insert(emberLedger).values(entry).run();
  return entry;
};

/**
 * Registra un gasto validando el balance (jamás por debajo de 0).
 * Tira Error('No te alcanzan las brasas') si no alcanza.
 */
export const gastarBrasas = (costo: number, motivo: string): EmberEntry => {
  const entry = crearGasto(ledgerTodo(), {
    id: nuevoId(),
    costo,
    motivo,
    fecha: ahoraISO(),
  });
  db.insert(emberLedger).values(entry).run();
  return entry;
};

// ---------------------------------------------------------------------------
// Estrellas
// ---------------------------------------------------------------------------

export const estrellasTodas = (): StarRow[] =>
  db.select().from(stars).orderBy(asc(stars.createdAt)).all();

export interface NuevaEstrella {
  tipo: TipoEstrella;
  texto?: string | null;
  photoUri?: string | null;
  lat?: number | null;
  lng?: number | null;
  expeditionId?: string | null;
  expeditionStepKey?: string | null;
  /** Hora local 0-23; por defecto la del reloj (flag nocturna). */
  hora?: number;
  /** ¿Hay un evento fugaz activo? (flag fugaz). */
  eventoActivo?: boolean;
}

/** Crea una estrella calculando sus rarezas contra el cielo existente. */
export const crearEstrella = (input: NuevaEstrella): StarRow => {
  const rarezas = calcularRarezas(
    {
      tipo: input.tipo,
      hora: input.hora ?? horaLocal(),
      eventoActivo: input.eventoActivo ?? false,
    },
    estrellasTodas(),
  );
  const row: StarRow = {
    id: nuevoId(),
    tipo: input.tipo,
    texto: input.texto ?? null,
    photoUri: input.photoUri ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    ...rarezas,
    expeditionId: input.expeditionId ?? null,
    expeditionStepKey: input.expeditionStepKey ?? null,
    constelacionId: null,
    createdAt: ahoraISO(),
  };
  db.insert(stars).values(row).run();
  return row;
};

/**
 * Persiste asignaciones estrella→constelación (salida de computeColecciones
 * o completadasAlAgregar). La completación es pegajosa: una vez asignada,
 * la estrella queda para siempre en su constelación.
 */
export const persistirAsignaciones = (
  asignaciones: Record<string, string>,
): void => {
  for (const [starId, constelacionId] of Object.entries(asignaciones)) {
    db.update(stars).set({ constelacionId }).where(eq(stars.id, starId)).run();
  }
};

// ---------------------------------------------------------------------------
// Días y luces
// ---------------------------------------------------------------------------

const DIA_VACIO = (fecha: string): DayRow => ({
  fecha,
  ver: false,
  encender: false,
  dar: false,
  nocheCompleta: false,
});

/** El registro de hoy (o un vacío sin persistir si todavía no hay nada). */
export const diaDeHoy = (fecha: string = hoyLocal()): DayRow =>
  db.select().from(days).where(eq(days.fecha, fecha)).get() ?? DIA_VACIO(fecha);

export const diasTodos = (): DayRow[] =>
  db.select().from(days).orderBy(asc(days.fecha)).all();

export interface ResultadoLuz {
  dia: DayRow;
  /** false si la luz ya estaba encendida (operación idempotente). */
  luzNueva: boolean;
  /** true solo la vez que se completan las tres. */
  nocheCompletaNueva: boolean;
  brasasGanadas: number;
}

/**
 * Enciende una luz del día. Idempotente: re-encender no duplica brasas.
 * Paga +2 por la luz y +4 de bonus la vez que se completa la noche
 * (día completo = 10). `multiplicador: 2` en día de brasas x2.
 */
export const marcarLuz = (
  fecha: string,
  luz: Luz,
  opts: Pick<OpcionesBrasas, 'multiplicador'> = {},
): ResultadoLuz => {
  const previo = diaDeHoy(fecha);
  if (previo[luz]) {
    return { dia: previo, luzNueva: false, nocheCompletaNueva: false, brasasGanadas: 0 };
  }
  const dia: DayRow = { ...previo, [luz]: true };
  dia.nocheCompleta = dia.ver && dia.encender && dia.dar;
  db.insert(days)
    .values(dia)
    .onConflictDoUpdate({ target: days.fecha, set: dia })
    .run();

  const mult = opts.multiplicador ?? 1;
  let brasas = ganarBrasas(GANANCIAS.luz, motivoDeLuz(luz), { multiplicador: mult }).delta;
  const nocheCompletaNueva = dia.nocheCompleta && !previo.nocheCompleta;
  if (nocheCompletaNueva) {
    brasas += ganarBrasas(GANANCIAS.nocheCompleta, MOTIVOS.nocheCompleta, {
      multiplicador: mult,
    }).delta;
  }
  return { dia, luzNueva: true, nocheCompletaNueva, brasasGanadas: brasas };
};

/** Estado de la Estrella Guía hoy (racha + nubladas + viva). */
export const rachaActual = (hoy: string = hoyLocal()): RachaEstado =>
  computeRacha(diasTodos(), hoy, getSetting(CLAVES.ritoFecha));

/** Rito de re-encendido: la racha renace en 1 desde esta fecha (spec §2). */
export const registrarRito = (fecha: string = hoyLocal()): void => {
  setSetting(CLAVES.ritoFecha, fecha);
};

// ---------------------------------------------------------------------------
// Reflexiones (Bitácora)
// ---------------------------------------------------------------------------

export const guardarReflexion = (
  preguntaId: string,
  texto: string,
  fecha: string = hoyLocal(),
): ReflectionRow => {
  const row: ReflectionRow = { id: nuevoId(), preguntaId, texto, fecha };
  db.insert(reflections).values(row).run();
  return row;
};

export const reflexionesTodas = (): ReflectionRow[] =>
  db.select().from(reflections).orderBy(asc(reflections.fecha)).all();

// ---------------------------------------------------------------------------
// Compromisos (luz DAR — la confianza es la mecánica)
// ---------------------------------------------------------------------------

export const crearCompromiso = (
  texto: string,
  categoria: string,
  fecha: string = hoyLocal(),
): CommitmentRow => {
  const row: CommitmentRow = {
    id: nuevoId(),
    texto,
    categoria,
    fecha,
    estado: 'pendiente',
  };
  db.insert(commitments).values(row).run();
  return row;
};

/** El compromiso pendiente de ayer, para preguntar "¿Lo hiciste?". */
export const compromisoDeAyer = (hoy: string = hoyLocal()): CommitmentRow | null =>
  db
    .select()
    .from(commitments)
    .where(and(eq(commitments.fecha, addDias(hoy, -1)), eq(commitments.estado, 'pendiente')))
    .get() ?? null;

/** El compromiso elegido en una fecha dada (para releer el de hoy). */
export const compromisoDeFecha = (fecha: string = hoyLocal()): CommitmentRow | null =>
  db.select().from(commitments).where(eq(commitments.fecha, fecha)).get() ?? null;

export interface ResultadoCompromiso {
  compromiso: CommitmentRow;
  brasasGanadas: number;
}

/**
 * Resuelve un compromiso pendiente. Cumplido paga +3; "no" no castiga
 * (sin culpa, spec §2). Idempotente: uno ya resuelto no vuelve a pagar.
 */
export const resolverCompromiso = (
  id: string,
  cumplido: boolean,
  opts: Pick<OpcionesBrasas, 'multiplicador'> = {},
): ResultadoCompromiso | null => {
  const previo = db.select().from(commitments).where(eq(commitments.id, id)).get();
  if (!previo) return null;
  if (previo.estado !== 'pendiente') {
    return { compromiso: previo, brasasGanadas: 0 };
  }
  const estado = cumplido ? 'cumplido' : 'no';
  db.update(commitments).set({ estado }).where(eq(commitments.id, id)).run();
  const brasasGanadas = cumplido
    ? ganarBrasas(GANANCIAS.compromisoCumplido, MOTIVOS.compromisoCumplido, {
        multiplicador: opts.multiplicador ?? 1,
      }).delta
    : 0;
  return { compromiso: { ...previo, estado }, brasasGanadas };
};

// ---------------------------------------------------------------------------
// Expediciones
// ---------------------------------------------------------------------------

export interface NuevaExpedicion {
  plantillaId: string;
  titulo: string;
  zona: string;
  meta: number;
  /** 'propia' cuesta 15 brasas; 'precargada' y 'qr' son gratis (spec §3.2). */
  origen?: OrigenExpedicion;
}

/**
 * Funda (o importa) una expedición. Si el origen es 'propia' cobra las
 * 15 brasas primero — tira Error si no alcanzan y no crea nada.
 */
export const fundarExpedicion = (input: NuevaExpedicion): ExpeditionRow => {
  progresoExpedicion(0, input.meta); // valida la meta (entero ≥ 1)
  const origen = input.origen ?? 'propia';
  if (origen === 'propia') {
    gastarBrasas(COSTOS.fundarExpedicion, MOTIVOS.fundarExpedicion);
  }
  const row: ExpeditionRow = {
    id: nuevoId(),
    plantillaId: input.plantillaId,
    titulo: input.titulo,
    zona: input.zona,
    meta: input.meta,
    estado: 'activa',
    origen,
    hitosOtorgados: '[]',
    createdAt: ahoraISO(),
  };
  db.insert(expeditions).values(row).run();
  return row;
};

export const expedicionesTodas = (): ExpeditionRow[] =>
  db.select().from(expeditions).orderBy(asc(expeditions.createdAt)).all();

export const expedicionPorId = (id: string): ExpeditionRow | null =>
  db.select().from(expeditions).where(eq(expeditions.id, id)).get() ?? null;

export const entradasDeExpedicion = (expeditionId: string): ExpeditionEntryRow[] =>
  db
    .select()
    .from(expeditionEntries)
    .where(eq(expeditionEntries.expeditionId, expeditionId))
    .orderBy(asc(expeditionEntries.createdAt))
    .all();

export interface ResultadoEntrada {
  entrada: ExpeditionEntryRow;
  /** Hitos recién cruzados (cada uno paga una sola vez). */
  hitosNuevos: number[];
  estado: ExpeditionRow['estado'];
  brasasGanadas: number;
}

/**
 * Registra un paso de expedición: paga +3 por el paso, cruza hitos
 * (+10/+15/+25, cada uno una sola vez) y cierra la expedición al 100%.
 */
export const agregarEntradaExpedicion = (
  expeditionId: string,
  stepKey: string,
  data: unknown = {},
  starId: string | null = null,
  opts: Pick<OpcionesBrasas, 'multiplicador'> = {},
): ResultadoEntrada => {
  const exp = expedicionPorId(expeditionId);
  if (!exp) throw new Error('Esa expedición no existe');

  const entrada: ExpeditionEntryRow = {
    id: nuevoId(),
    expeditionId,
    stepKey,
    data: JSON.stringify(data ?? {}),
    starId,
    createdAt: ahoraISO(),
  };
  db.insert(expeditionEntries).values(entrada).run();

  const mult = opts.multiplicador ?? 1;
  let brasasGanadas = ganarBrasas(GANANCIAS.pasoExpedicion, MOTIVOS.pasoExpedicion, {
    multiplicador: mult,
  }).delta;

  const entradas = entradasDeExpedicion(expeditionId).length;
  const otorgados = JSON.parse(exp.hitosOtorgados) as number[];
  const hitosNuevos = hitosCruzados(entradas, exp.meta, otorgados);
  for (const hito of hitosNuevos) {
    brasasGanadas += ganarBrasas(BRASAS_POR_HITO[hito], MOTIVO_POR_HITO[hito], {
      multiplicador: mult,
    }).delta;
  }

  const { estado } = progresoExpedicion(entradas, exp.meta);
  db.update(expeditions)
    .set({
      estado,
      hitosOtorgados: JSON.stringify([...otorgados, ...hitosNuevos]),
    })
    .where(eq(expeditions.id, expeditionId))
    .run();

  return { entrada, hitosNuevos: [...hitosNuevos], estado, brasasGanadas };
};

// ---------------------------------------------------------------------------
// Unlocks (cartas de lore, paletas, rangos)
// ---------------------------------------------------------------------------

export const tieneUnlock = (tipo: TipoUnlock, clave: string): boolean =>
  db
    .select()
    .from(unlocks)
    .where(and(eq(unlocks.tipo, tipo), eq(unlocks.clave, clave)))
    .get() !== undefined;

/** Otorga un unlock una sola vez; devuelve null si ya estaba. */
export const otorgarUnlock = (
  tipo: TipoUnlock,
  clave: string,
  fecha: string = hoyLocal(),
): UnlockRow | null => {
  if (tieneUnlock(tipo, clave)) return null;
  const row: UnlockRow = { id: nuevoId(), tipo, clave, fecha };
  db.insert(unlocks).values(row).run();
  return row;
};

export const unlocksTodos = (): UnlockRow[] =>
  db.select().from(unlocks).orderBy(asc(unlocks.fecha)).all();

// ---------------------------------------------------------------------------
// Chispas — anti-replay local
// ---------------------------------------------------------------------------

/**
 * Canjea un nonce de chispa: inserta o rechaza (anti-replay, spec §3.5).
 * true = nonce nuevo, canje válido; false = ya se usó en este dispositivo.
 */
export const canjearNonce = (nonce: string, fecha: string = hoyLocal()): boolean =>
  db.insert(redeemedNonces).values({ nonce, fecha }).onConflictDoNothing().run()
    .changes > 0;

// ---------------------------------------------------------------------------
// Export y borrado total (spec §3.7 — ética innegociable)
// ---------------------------------------------------------------------------

/** Todo lo tuyo, en un solo objeto JSON listo para compartir/guardar. */
export const exportarTodo = (): Record<string, unknown> => ({
  exportadoEn: ahoraISO(),
  version: 1,
  stars: estrellasTodas(),
  reflections: reflexionesTodas(),
  commitments: db.select().from(commitments).all(),
  days: diasTodos(),
  expeditions: expedicionesTodas(),
  expeditionEntries: db.select().from(expeditionEntries).all(),
  emberLedger: ledgerTodo(),
  unlocks: unlocksTodos(),
  redeemedNonces: db.select().from(redeemedNonces).all(),
  settings: db.select().from(settings).all(),
});

/** Borra TODO. No hay vuelta atrás — la UI confirma dos veces antes. */
export const borrarTodo = (): void => {
  db.delete(expeditionEntries).run();
  db.delete(expeditions).run();
  db.delete(stars).run();
  db.delete(reflections).run();
  db.delete(commitments).run();
  db.delete(days).run();
  db.delete(emberLedger).run();
  db.delete(unlocks).run();
  db.delete(redeemedNonces).run();
  db.delete(settings).run();
};
