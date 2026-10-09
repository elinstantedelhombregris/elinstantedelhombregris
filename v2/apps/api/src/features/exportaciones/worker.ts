import { createHash } from 'node:crypto';

import {
  DatosParticipacionRepository,
  ExportacionesRepository,
  getDb,
  MAX_REGISTROS_EXPORTACION,
} from '@v2/db';
import { consultaParticipacionSchema, LICENCIAS } from '@v2/shared';

import { logger } from '../../lib/logger.js';
import { fuenteDeBase } from '../radiografia/lectura.js';
import { construirRadiografia } from '../radiografia/service.js';
import { consultaRadiografiaSchema } from '../radiografia/validation.js';

import { inicioRegistros, paginaRegistros } from './formatos.js';

import type { Db, ExportacionFila } from '@v2/db';

const LEEME = `¡BASTA! — Registro público

Este paquete contiene el alcance y el corte declarados en manifest.json. No representa a la población. Los registros no equivalen a personas; semejanza temática no equivale a acuerdo.

Quedan fuera identidades internas, cuentas, actores, relatos privados, respuestas individuales y vectores. El texto sin cesión se omite y las coordenadas se protegen. CSV evita fórmulas; JSONL conserva valores literales.

Procesos contiene metadatos y vínculos públicos, sin contratos libres ni textos sin licencia. La fecha de corte fija la creación de fuentes; no reconstruye una instantánea histórica. Los permisos se revisan al preparar y entregar. Una corrección o retiro invalida el paquete y exige pedir otro. Una copia ya descargada no se puede recuperar.

El SHA256 del manifiesto verifica JSON.stringify(fragmentos), no el ZIP completo. Cada fragmento declara su archivo, orden, longitud en bytes y SHA256: separá los bytes UTF-8 de cada archivo según esas longitudes y verificá cada suma. No incluye el propio manifiesto ni LEEME. Si se incluye analisis.json, registra una lectura acotada del grafo con modelo y parámetros, sin matriz ni vectores. No permite reproducir partes derivadas de datos no publicados.
`;

async function paso(
  repo: ExportacionesRepository,
  fuente: DatosParticipacionRepository,
  f: ExportacionFila,
  db: Db,
) {
  const archivo = `senales.${f.solicitud.formato}`;
  if (f.orden === 0)
    return repo.agregar(f, {
      archivo,
      contenido: inicioRegistros(f.solicitud.formato),
      fase: 'senales',
      cursor: null,
    });
  if (f.fase === 'senales') {
    const q = consultaParticipacionSchema.parse({
      ...f.solicitud.filtros,
      limite: 100,
      ...(f.cursor ? { cursor: f.cursor } : {}),
    });
    const p = await fuente.pagina(q, f.corte);
    if (p.total > MAX_REGISTROS_EXPORTACION) throw new Error('ALCANCE_EXCESIVO');
    return repo.agregar(f, {
      archivo,
      contenido: paginaRegistros(f.solicitud.formato, p.registros, f.registros, !p.siguiente),
      fase: p.siguiente ? 'senales' : 'campanas',
      cursor: p.siguiente,
      registros: p.registros.length,
      total: p.total,
      reservados: p.textoOmitido,
    });
  }
  if (f.fase === 'campanas' || f.fase === 'fichas') {
    const p = await fuente.contextoPagina(f.solicitud.filtros, f.corte, f.fase, f.cursor);
    const inicio = f.cursor
      ? p.datos.length
        ? ','
        : ''
      : f.fase === 'campanas'
        ? `{"corte":${JSON.stringify(f.corte.toISOString())},"nota":"Metadatos públicos con permisos vigentes. No es una instantánea histórica.","campanas":[`
        : '],"fichas":[';
    const fin = !p.siguiente && f.fase === 'fichas' ? ']}' : '';
    return repo.agregar(f, {
      archivo: 'procesos.json',
      contenido: inicio + p.datos.map((d) => JSON.stringify(d)).join(',') + fin,
      fase: p.siguiente ? f.fase : f.fase === 'campanas' ? 'fichas' : 'analisis',
      cursor: p.siguiente,
    });
  }
  if (f.fase === 'analisis') {
    const parametros = f.solicitud.analisis;
    const hasta =
      f.solicitud.filtros.hasta && new Date(f.solicitud.filtros.hasta) < f.corte
        ? f.solicitud.filtros.hasta
        : f.corte.toISOString();
    const consulta = consultaRadiografiaSchema.parse({
      ...f.solicitud.filtros,
      hasta,
      ...parametros,
    });
    const contenido = parametros
      ? JSON.stringify(await construirRadiografia(fuenteDeBase(db, consulta), consulta))
      : '';
    return repo.agregar(f, {
      archivo: parametros ? 'analisis.json' : 'procesos.json',
      contenido,
      fase: 'manifiesto',
      cursor: null,
    });
  }
  if (f.fase === 'manifiesto') {
    const fragmentos = await repo.indice(f.id);
    const contenido = JSON.stringify({
      esquema: 'basta-registro-publico/v2',
      generadoEn: new Date().toISOString(),
      corte: f.corte.toISOString(),
      completo: true,
      filtros: f.solicitud.filtros,
      parametrosAnalisis: f.solicitud.analisis ?? null,
      revisionPublica: f.revisionPublica,
      venceEn: f.venceEn.toISOString(),
      conteos: {
        elegibles: f.total,
        entregados: f.registros,
        textosReservados: f.textosReservados,
      },
      licencias: { compilacion: LICENCIAS.compilacion.id, textos: LICENCIAS.textos.id },
      omisiones: [
        'Identidades, cuentas, actores, relatos privados, respuestas individuales, matrices y vectores.',
        'Texto sin cesión y coordenadas sensibles.',
      ],
      metodo:
        'Consulta paginada por ID público con corte de creación fijo, revisión de permisos y ZIP por flujo.',
      sha256: createHash('sha256').update(JSON.stringify(fragmentos)).digest('hex'),
      checksumMetodo:
        'sha256(JSON.stringify(fragmentos)); cada fragmento verifica bytes UTF-8 de su archivo',
      fragmentos,
      archivos: [
        archivo,
        'procesos.json',
        ...(f.solicitud.analisis ? ['analisis.json'] : []),
        'manifest.json',
        'LEEME.txt',
      ],
    });
    return repo.agregar(f, { archivo: 'manifest.json', contenido, fase: 'leeme', cursor: null });
  }
  if (f.fase === 'leeme')
    return repo.agregar(f, {
      archivo: 'LEEME.txt',
      contenido: LEEME,
      fase: 'terminar',
      cursor: null,
    });
  if (f.fase !== 'terminar') throw new Error('FASE_INVALIDA');
  if (f.registros !== f.total) throw new Error('AVANCE_RECHAZADO');
  await repo.disponible(f);
  return null;
}

/** Una invocación acotada: progreso durable por fragmento. Un proceso muerto se retoma al vencer el lease. */
export async function prepararExportaciones(
  opciones: { db?: Db; maxPasos?: number; presupuestoMs?: number } = {},
) {
  const db = opciones.db ?? getDb();
  const repo = new ExportacionesRepository(db);
  await repo.limpiar();
  let f = await repo.tomar();
  if (!f) return { trabajo: null, pasos: 0 };
  const id = f.id;
  const inicio = Date.now();
  let pasos = 0;
  try {
    const vigente = await repo.vigencia(f.id);
    if (vigente?.estado !== 'preparando') return { trabajo: id, pasos };
    f = vigente;
    const fuente = new DatosParticipacionRepository(db);
    while (
      f &&
      pasos < Math.min(opciones.maxPasos ?? 20, 100) &&
      Date.now() - inicio < Math.min(opciones.presupuestoMs ?? 35_000, 45_000)
    ) {
      f = await paso(repo, fuente, f, db);
      pasos++;
    }
    if (f) await repo.liberar(f);
  } catch (error) {
    if (f) {
      const codigo = error instanceof Error ? error.message : 'ERROR';
      if (
        ['ALCANCE_EXCESIVO', 'FRAGMENTO_EXCESIVO', 'AVANCE_RECHAZADO', 'FASE_INVALIDA'].includes(
          codigo,
        )
      ) {
        await repo.fallar(
          f,
          codigo === 'ALCANCE_EXCESIVO'
            ? 'Este alcance supera los 100.000 registros. Elegí zona, tema o fechas para dividirlo.'
            : 'El alcance cambió o excedió 256 MB. Pedí una lectura nueva o dividí el alcance.',
        );
      } else {
        logger.warn(
          { trabajo: f.id, errorName: error instanceof Error ? error.name : 'Error' },
          'Preparación interrumpida; se conserva el cursor',
        );
        await repo.errorTemporal(f);
      }
    }
  }
  return { trabajo: id, pasos };
}
