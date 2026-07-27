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
import { civicCaptureKeys } from '../game/capture-attempt';
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
import { db, type DBExecutor } from './client';
import {
  civicActions,
  civicConsents,
  civicCustodyResponseIntents,
  civicCustodyExecutionIntents,
  civicDisclosureReceipts,
  civicListenings,
  civicMissionCells,
  civicMissions,
  civicMatches,
  civicNeedAccessGrants,
  civicNeedCustodies,
  civicNeeds,
  civicObservations,
  civicResources,
  civicRecordContexts,
  civicTerritories,
  civicVerifications,
  commitments,
  days,
  emberLedger,
  expeditionEntries,
  expeditions,
  pvMisionMiembros,
  pvMisiones,
  pvObras,
  pvPulsos,
  redeemedNonces,
  reflections,
  settings,
  stars,
  syncOutbox,
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
  corrienteUltimaVisita: 'corriente_ultima_visita',
  pactoAceptado: 'pacto_aceptado',
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

export const ledgerTodo = (database: DBExecutor = db): EmberEntry[] =>
  database.select().from(emberLedger).orderBy(asc(emberLedger.fecha)).all();

export const brasasBalance = (): number => balance(ledgerTodo());

/** Total histórico ganado — mueve los rangos (spec §3.3). */
export const brasasTotalGanado = (): number => totalGanado(ledgerTodo());

export interface OpcionesBrasas {
  /** 2 en día de brasas x2 (evento fugaz). */
  multiplicador?: 1 | 2;
  fecha?: string;
  /** Executor interno para componer recompensas con su acción causal. */
  database?: DBExecutor;
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
  (opts.database ?? db).insert(emberLedger).values(entry).run();
  return entry;
};

/** Ganancia idempotente ligada a un resultado cívico estable. */
export const ganarBrasasUnaVez = (
  id: string,
  delta: number,
  motivo: string,
  opts: OpcionesBrasas = {},
): EmberEntry | null => {
  const entry = crearGanancia({
    id,
    delta,
    motivo,
    fecha: opts.fecha ?? ahoraISO(),
    multiplicador: opts.multiplicador ?? 1,
  });
  const result = (opts.database ?? db).insert(emberLedger).values(entry).onConflictDoNothing().run();
  return result.changes > 0 ? entry : null;
};

/**
 * Registra un gasto validando el balance (jamás por debajo de 0).
 * Tira Error('No te alcanzan las brasas') si no alcanza.
 */
export const gastarBrasas = (costo: number, motivo: string, database: DBExecutor = db): EmberEntry => {
  const entry = crearGasto(ledgerTodo(database), {
    id: nuevoId(),
    costo,
    motivo,
    fecha: ahoraISO(),
  });
  database.insert(emberLedger).values(entry).run();
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

const prepararEstrella = (id: string, input: NuevaEstrella): StarRow => {
  const rarezas = calcularRarezas(
    {
      tipo: input.tipo,
      hora: input.hora ?? horaLocal(),
      eventoActivo: input.eventoActivo ?? false,
    },
    estrellasTodas(),
  );
  return {
    id,
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
};

/** Crea una estrella calculando sus rarezas contra el cielo existente. */
export const crearEstrella = (input: NuevaEstrella): StarRow => {
  const row = prepararEstrella(nuevoId(), input);
  db.insert(stars).values(row).run();
  return row;
};

/**
 * Variante exclusiva de una captura cívica reintentable. El intento usa su
 * UUID como PK de estrella: si una escritura posterior falla, volver a llamar
 * devuelve la misma estrella y nunca recalcula una segunda rareza.
 */
export const crearEstrellaCivicaUnaVez = (
  captureAttemptId: string,
  input: NuevaEstrella,
): StarRow => {
  const validate = (star: StarRow): StarRow => {
    if (
      star.tipo !== input.tipo
      || star.expeditionId !== (input.expeditionId ?? null)
      || star.expeditionStepKey !== (input.expeditionStepKey ?? null)
    ) throw new Error('capture_attempt_star_mismatch');
    return star;
  };
  const existing = db.select().from(stars).where(eq(stars.id, captureAttemptId)).get();
  if (existing) return validate(existing);
  const row = prepararEstrella(captureAttemptId, input);
  db.insert(stars).values(row).onConflictDoNothing().run();
  return validate(db.select().from(stars).where(eq(stars.id, captureAttemptId)).get() ?? row);
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
export const diaDeHoy = (fecha: string = hoyLocal(), database: DBExecutor = db): DayRow =>
  database.select().from(days).where(eq(days.fecha, fecha)).get() ?? DIA_VACIO(fecha);

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
  return db.transaction((tx) => {
    const previo = diaDeHoy(fecha, tx);
    if (previo[luz]) {
      return { dia: previo, luzNueva: false, nocheCompletaNueva: false, brasasGanadas: 0 };
    }
    const dia: DayRow = { ...previo, [luz]: true };
    dia.nocheCompleta = dia.ver && dia.encender && dia.dar;
    tx.insert(days)
      .values(dia)
      .onConflictDoUpdate({ target: days.fecha, set: dia })
      .run();

    const mult = opts.multiplicador ?? 1;
    let brasas = ganarBrasas(GANANCIAS.luz, motivoDeLuz(luz), { multiplicador: mult, database: tx }).delta;
    const nocheCompletaNueva = dia.nocheCompleta && !previo.nocheCompleta;
    if (nocheCompletaNueva) {
      brasas += ganarBrasas(GANANCIAS.nocheCompleta, MOTIVOS.nocheCompleta, {
        multiplicador: mult,
        database: tx,
      }).delta;
    }
    return { dia, luzNueva: true, nocheCompletaNueva, brasasGanadas: brasas };
  });
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
  return db.transaction((tx) => {
    const previo = tx.select().from(commitments).where(eq(commitments.id, id)).get();
    if (!previo) return null;
    if (previo.estado !== 'pendiente') {
      return { compromiso: previo, brasasGanadas: 0 };
    }
    const estado = cumplido ? 'cumplido' : 'no';
    tx.update(commitments).set({ estado }).where(eq(commitments.id, id)).run();
    const brasasGanadas = cumplido
      ? ganarBrasas(GANANCIAS.compromisoCumplido, MOTIVOS.compromisoCumplido, {
          multiplicador: opts.multiplicador ?? 1,
          database: tx,
        }).delta
      : 0;
    return { compromiso: { ...previo, estado }, brasasGanadas };
  });
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
  return db.transaction((tx) => {
    const origen = input.origen ?? 'propia';
    if (origen === 'propia') {
      gastarBrasas(COSTOS.fundarExpedicion, MOTIVOS.fundarExpedicion, tx);
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
    tx.insert(expeditions).values(row).run();
    return row;
  });
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
 * Registra un paso de expedición. Las expediciones clásicas pagan +3; una
 * misión cívica puede bajar la base y completar la recompensa sólo al cerrar
 * cobertura válida. Cruza hitos
 * (+10/+15/+25, cada uno una sola vez) y cierra la expedición al 100%.
 */
export const agregarEntradaExpedicion = (
  expeditionId: string,
  stepKey: string,
  data: unknown = {},
  starId: string | null = null,
  opts: Pick<OpcionesBrasas, 'multiplicador'> & { baseReward?: number } = {},
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
  const baseReward = opts.baseReward ?? GANANCIAS.pasoExpedicion;
  let brasasGanadas = baseReward > 0
    ? ganarBrasas(baseReward, baseReward === GANANCIAS.pasoExpedicion ? MOTIVOS.pasoExpedicion : MOTIVOS.capturaHonesta, {
        multiplicador: mult,
      }).delta
    : 0;

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

/**
 * Completa la parte lúdica de una captura cívica con claves recuperables.
 * Cada llamada vuelve a asegurar entrada, recompensa base, hitos y estado; lo
 * ya escrito se detecta por PK y sólo se repara lo que haya quedado pendiente.
 * `agregarEntradaExpedicion` permanece intacta para expediciones personales.
 */
export const agregarEntradaCivicaUnaVez = (
  captureAttemptId: string,
  expeditionId: string,
  stepKey: string,
  data: unknown,
  starId: string,
  opts: Pick<OpcionesBrasas, 'multiplicador'> & { baseReward: number },
): ResultadoEntrada => {
  const keys = civicCaptureKeys(captureAttemptId, expeditionId);
  const exp = expedicionPorId(expeditionId);
  if (!exp) throw new Error('Esa expedición no existe');
  if (starId !== keys.starId) throw new Error('capture_attempt_star_mismatch');

  let entrada = db.select().from(expeditionEntries).where(eq(expeditionEntries.id, keys.entryId)).get();
  if (entrada && (
    entrada.expeditionId !== expeditionId
    || entrada.stepKey !== stepKey
    || entrada.starId !== starId
  )) {
    throw new Error('capture_attempt_entry_mismatch');
  }
  if (!entrada) {
    const candidate: ExpeditionEntryRow = {
      id: keys.entryId,
      expeditionId,
      stepKey,
      data: JSON.stringify(data ?? {}),
      starId,
      createdAt: ahoraISO(),
    };
    db.insert(expeditionEntries).values(candidate).onConflictDoNothing().run();
    entrada = db.select().from(expeditionEntries).where(eq(expeditionEntries.id, keys.entryId)).get() ?? candidate;
  }

  const mult = opts.multiplicador ?? 1;
  const base = opts.baseReward > 0
    ? ganarBrasasUnaVez(
        keys.baseRewardId,
        opts.baseReward,
        MOTIVOS.capturaHonesta,
        { multiplicador: mult },
      )
    : null;
  let brasasGanadas = base?.delta ?? 0;

  // Se vuelve a leer la expedición: un intento anterior pudo alcanzar a
  // insertar la entrada o pagar una recompensa antes de interrumpirse.
  const current = expedicionPorId(expeditionId);
  if (!current) throw new Error('Esa expedición no existe');
  const entradas = entradasDeExpedicion(expeditionId).length;
  const otorgados = JSON.parse(current.hitosOtorgados) as number[];
  const hitosNuevos = hitosCruzados(entradas, current.meta, otorgados);
  for (const hito of hitosNuevos) {
    const reward = ganarBrasasUnaVez(
      keys.milestoneRewardId(hito),
      BRASAS_POR_HITO[hito],
      MOTIVO_POR_HITO[hito],
      { multiplicador: mult },
    );
    brasasGanadas += reward?.delta ?? 0;
  }

  const { estado } = progresoExpedicion(entradas, current.meta);
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
// Export y borrado local (spec §3.7 — ética innegociable)
// ---------------------------------------------------------------------------

/**
 * Copia completa de la base local, en una sola instantánea consistente.
 * La versión 10 inventaría también los comandos privados de respuesta y
 * ejecución pendientes, necesarios para reintentos exactos después de reiniciar.
 * La versión 11 suma las tablas pv_* del Protocolo Vivo (Mission Layer):
 * misiones, membresías, obras y pulsos.
 * Las credenciales de acceso de SecureStore/AsyncStorage no se exportan.
 */
export const exportarTodo = (): Record<string, unknown> => {
  const exportadoEn = ahoraISO();
  return db.transaction((tx) => ({
    exportadoEn,
    version: 11,
    stars: tx.select().from(stars).orderBy(asc(stars.createdAt)).all(),
    reflections: tx.select().from(reflections).orderBy(asc(reflections.fecha)).all(),
    commitments: tx.select().from(commitments).all(),
    days: tx.select().from(days).orderBy(asc(days.fecha)).all(),
    expeditions: tx.select().from(expeditions).orderBy(asc(expeditions.createdAt)).all(),
    expeditionEntries: tx.select().from(expeditionEntries).all(),
    emberLedger: tx.select().from(emberLedger).orderBy(asc(emberLedger.fecha)).all(),
    unlocks: tx.select().from(unlocks).orderBy(asc(unlocks.fecha)).all(),
    redeemedNonces: tx.select().from(redeemedNonces).all(),
    settings: tx.select().from(settings).all(),
    territories: tx.select().from(civicTerritories).all(),
    missions: tx.select().from(civicMissions).all(),
    missionCells: tx.select().from(civicMissionCells).all(),
    civicListenings: tx.select().from(civicListenings).all(),
    civicRecordContexts: tx.select().from(civicRecordContexts).all(),
    civicDisclosureReceipts: tx.select().from(civicDisclosureReceipts).all(),
    observations: tx.select().from(civicObservations).all(),
    needs: tx.select().from(civicNeeds).all(),
    needCustodies: tx.select().from(civicNeedCustodies).all(),
    needAccessGrants: tx.select().from(civicNeedAccessGrants).all(),
    custodyResponseIntents: tx.select().from(civicCustodyResponseIntents).all(),
    custodyExecutionIntents: tx.select().from(civicCustodyExecutionIntents).all(),
    resources: tx.select().from(civicResources).all(),
    verifications: tx.select().from(civicVerifications).all(),
    matches: tx.select().from(civicMatches).all(),
    actions: tx.select().from(civicActions).all(),
    consents: tx.select().from(civicConsents).all(),
    outbox: tx.select().from(syncOutbox).all(),
    pvMisiones: tx.select().from(pvMisiones).all(),
    pvMisionMiembros: tx.select().from(pvMisionMiembros).all(),
    pvObras: tx.select().from(pvObras).all(),
    pvPulsos: tx.select().from(pvPulsos).all(),
  }));
};

/** Borra atómicamente todas las tablas locales. No afecta copias remotas. */
export const borrarTodo = (): void => {
  db.transaction((tx) => {
    if (tx.select().from(civicCustodyExecutionIntents).all().length > 0) {
      throw new Error('custody_execution_intent_pending');
    }
    tx.delete(syncOutbox).run();
    tx.delete(civicCustodyExecutionIntents).run();
    tx.delete(civicCustodyResponseIntents).run();
    tx.delete(civicActions).run();
    tx.delete(civicMatches).run();
    tx.delete(civicNeedAccessGrants).run();
    tx.delete(civicNeedCustodies).run();
    tx.delete(civicVerifications).run();
    tx.delete(civicListenings).run();
    tx.delete(civicDisclosureReceipts).run();
    tx.delete(civicRecordContexts).run();
    tx.delete(civicMissionCells).run();
    tx.delete(civicMissions).run();
    tx.delete(civicNeeds).run();
    tx.delete(civicResources).run();
    tx.delete(civicObservations).run();
    tx.delete(civicTerritories).run();
    tx.delete(civicConsents).run();

    tx.delete(pvPulsos).run();
    tx.delete(pvMisionMiembros).run();
    tx.delete(pvObras).run();
    tx.delete(pvMisiones).run();

    tx.delete(expeditionEntries).run();
    tx.delete(stars).run();
    tx.delete(expeditions).run();
    tx.delete(reflections).run();
    tx.delete(commitments).run();
    tx.delete(days).run();
    tx.delete(emberLedger).run();
    tx.delete(unlocks).run();
    tx.delete(redeemedNonces).run();
    tx.delete(settings).run();
  });
};
