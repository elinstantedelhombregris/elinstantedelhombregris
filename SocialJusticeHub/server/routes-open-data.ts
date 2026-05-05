import type { Express } from 'express';
import { db } from './db';
import { dreams, userCommitments, userResources, users } from '@shared/schema';
import { eq, and, isNull, or, sql } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';
import { stringify } from 'csv-stringify/sync';
import initSqlJs from 'sql.js';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { publicReadRateLimit } from './middleware';

// In-memory cache for generated exports
const cache = new Map<string, { buffer: Buffer; generatedAt: Date; counts: { dreams: number; commitments: number; resources: number } }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function isCacheFresh(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.generatedAt.getTime() < CACHE_TTL;
}

// Rate limiter for downloads
const openDataRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas descargas. Intentá nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Query helpers — exclude opted-out users
async function queryDreams() {
  const rows = await db
    .select({
      dream: dreams.dream,
      value: dreams.value,
      need: dreams.need,
      basta: dreams.basta,
      type: dreams.type,
      location: dreams.location,
      latitude: dreams.latitude,
      longitude: dreams.longitude,
      createdAt: dreams.createdAt,
    })
    .from(dreams)
    .leftJoin(users, eq(dreams.userId, users.id))
    .where(
      or(
        isNull(dreams.userId),
        isNull(users.dataShareOptOut),
        eq(users.dataShareOptOut, false)
      )
    );
  return rows.map((r, i) => ({ exportId: i + 1, ...r }));
}

async function queryCommitments() {
  const rows = await db
    .select({
      commitmentText: userCommitments.commitmentText,
      commitmentType: userCommitments.commitmentType,
      province: userCommitments.province,
      city: userCommitments.city,
      latitude: userCommitments.latitude,
      longitude: userCommitments.longitude,
      createdAt: userCommitments.createdAt,
    })
    .from(userCommitments)
    .leftJoin(users, eq(userCommitments.userId, users.id))
    .where(
      or(
        isNull(userCommitments.userId),
        isNull(users.dataShareOptOut),
        eq(users.dataShareOptOut, false)
      )
    );
  return rows.map((r, i) => ({ exportId: i + 1, ...r }));
}

async function queryResources() {
  const rows = await db
    .select({
      description: userResources.description,
      category: userResources.category,
      availableHours: userResources.availableHours,
      latitude: userResources.latitude,
      longitude: userResources.longitude,
      location: userResources.location,
      province: userResources.province,
      city: userResources.city,
      isActive: userResources.isActive,
      createdAt: userResources.createdAt,
    })
    .from(userResources)
    .leftJoin(users, eq(userResources.userId, users.id))
    .where(
      and(
        eq(userResources.isActive, true),
        or(
          isNull(userResources.userId),
          isNull(users.dataShareOptOut),
          eq(users.dataShareOptOut, false)
        )
      )
    );
  return rows.map((r, i) => ({ exportId: i + 1, ...r }));
}

async function fetchAllData() {
  const [dreamsData, commitmentsData, resourcesData] = await Promise.all([
    queryDreams(),
    queryCommitments(),
    queryResources(),
  ]);
  return { dreams: dreamsData, commitments: commitmentsData, resources: resourcesData };
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

// Format generators
async function generateJSON(data: Awaited<ReturnType<typeof fetchAllData>>): Promise<Buffer> {
  const payload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      source: 'El Instante del Hombre Gris — Datos Abiertos',
      license: 'CC BY 4.0',
      description: 'Datos anónimos del mapa colectivo: sueños, compromisos y recursos declarados por la comunidad.',
      recordCounts: {
        dreams: data.dreams.length,
        commitments: data.commitments.length,
        resources: data.resources.length,
      },
    },
    suenos: data.dreams,
    compromisos: data.commitments,
    recursos: data.resources,
  };
  return Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
}

async function generateCSV(data: Awaited<ReturnType<typeof fetchAllData>>): Promise<Buffer> {
  const dreamsCSV = stringify(data.dreams, { header: true });
  const commitmentsCSV = stringify(data.commitments, { header: true });
  const resourcesCSV = stringify(data.resources, { header: true });

  const readme = `DATOS ABIERTOS — El Instante del Hombre Gris
=============================================
Exportado: ${new Date().toISOString()}
Licencia: CC BY 4.0

Archivos incluidos:
- suenos.csv: Sueños, valores, necesidades y declaraciones ¡Basta! (${data.dreams.length} registros)
- compromisos.csv: Compromisos públicos de la comunidad (${data.commitments.length} registros)
- recursos.csv: Recursos declarados — habilidades, tiempo, espacios (${data.resources.length} registros)

Todos los datos son anónimos. No contienen identificadores de usuario.
Los usuarios pueden excluir sus datos desde su perfil.
`;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const passthrough = new PassThrough();
    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(chunks)));
    passthrough.on('error', reject);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', reject);
    archive.pipe(passthrough);
    archive.append(dreamsCSV, { name: 'suenos.csv' });
    archive.append(commitmentsCSV, { name: 'compromisos.csv' });
    archive.append(resourcesCSV, { name: 'recursos.csv' });
    archive.append(readme, { name: 'README.txt' });
    archive.finalize();
  });
}

async function generateSQLite(data: Awaited<ReturnType<typeof fetchAllData>>): Promise<Buffer> {
  // Explicitly load the WASM binary so it works in Vercel serverless
  const require = createRequire(import.meta.url);
  const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmBinary = new Uint8Array(wasmBuffer).buffer as ArrayBuffer;
  const SQL = await initSqlJs({ wasmBinary });
  const sqliteDb = new SQL.Database();

  sqliteDb.run(`CREATE TABLE suenos (
    export_id INTEGER PRIMARY KEY,
    dream TEXT,
    value TEXT,
    need TEXT,
    basta TEXT,
    type TEXT,
    location TEXT,
    latitude TEXT,
    longitude TEXT,
    created_at TEXT
  )`);

  sqliteDb.run(`CREATE TABLE compromisos (
    export_id INTEGER PRIMARY KEY,
    commitment_text TEXT,
    commitment_type TEXT,
    province TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    created_at TEXT
  )`);

  sqliteDb.run(`CREATE TABLE recursos (
    export_id INTEGER PRIMARY KEY,
    description TEXT,
    category TEXT,
    available_hours INTEGER,
    latitude REAL,
    longitude REAL,
    location TEXT,
    province TEXT,
    city TEXT,
    is_active INTEGER,
    created_at TEXT
  )`);

  const insertDream = sqliteDb.prepare(
    'INSERT INTO suenos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const d of data.dreams) {
    insertDream.run([d.exportId, d.dream, d.value, d.need, d.basta, d.type, d.location, d.latitude, d.longitude, d.createdAt]);
  }
  insertDream.free();

  const insertCommitment = sqliteDb.prepare(
    'INSERT INTO compromisos VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const c of data.commitments) {
    insertCommitment.run([c.exportId, c.commitmentText, c.commitmentType, c.province, c.city, c.latitude, c.longitude, c.createdAt]);
  }
  insertCommitment.free();

  const insertResource = sqliteDb.prepare(
    'INSERT INTO recursos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const r of data.resources) {
    insertResource.run([r.exportId, r.description, r.category, r.availableHours, r.latitude, r.longitude, r.location, r.province, r.city, r.isActive ? 1 : 0, r.createdAt]);
  }
  insertResource.free();

  // Add metadata table
  sqliteDb.run(`CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT)`);
  const insertMeta = sqliteDb.prepare('INSERT INTO metadata VALUES (?, ?)');
  insertMeta.run(['exported_at', new Date().toISOString()]);
  insertMeta.run(['version', '1.0']);
  insertMeta.run(['license', 'CC BY 4.0']);
  insertMeta.run(['source', 'El Instante del Hombre Gris']);
  insertMeta.free();

  const binary = sqliteDb.export();
  sqliteDb.close();
  return Buffer.from(binary);
}

export function registerOpenDataRoutes(app: Express) {

  // GET /api/open-data/stats — public stats
  app.get('/api/open-data/stats', publicReadRateLimit, async (_req, res) => {
    try {
      const [dreamsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(dreams)
        .leftJoin(users, eq(dreams.userId, users.id))
        .where(or(isNull(dreams.userId), isNull(users.dataShareOptOut), eq(users.dataShareOptOut, false)));

      const [commitmentsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userCommitments)
        .leftJoin(users, eq(userCommitments.userId, users.id))
        .where(or(isNull(userCommitments.userId), isNull(users.dataShareOptOut), eq(users.dataShareOptOut, false)));

      const [resourcesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userResources)
        .leftJoin(users, eq(userResources.userId, users.id))
        .where(
          and(
            eq(userResources.isActive, true),
            or(isNull(userResources.userId), isNull(users.dataShareOptOut), eq(users.dataShareOptOut, false))
          )
        );

      // Find when cache was last generated
      const lastGenerated = cache.get('json')?.generatedAt?.toISOString()
        || cache.get('csv')?.generatedAt?.toISOString()
        || cache.get('sqlite')?.generatedAt?.toISOString()
        || null;

      res.json({
        dreams: Number(dreamsCount.count),
        commitments: Number(commitmentsCount.count),
        resources: Number(resourcesCount.count),
        lastGenerated,
      });
    } catch (error) {
      console.error('Error fetching open data stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  // GET /api/open-data/download — generate and serve export
  app.get('/api/open-data/download', openDataRateLimit, async (req, res) => {
    try {
      const format = (req.query.format as string)?.toLowerCase();
      if (!format || !['json', 'csv', 'sqlite'].includes(format)) {
        return res.status(400).json({ error: 'Formato inválido. Usá: json, csv, o sqlite' });
      }

      // Check cache
      if (isCacheFresh(format)) {
        const cached = cache.get(format)!;
        return sendFile(res, format, cached.buffer);
      }

      // Generate fresh export
      const data = await fetchAllData();
      const counts = {
        dreams: data.dreams.length,
        commitments: data.commitments.length,
        resources: data.resources.length,
      };

      let buffer: Buffer;
      switch (format) {
        case 'json':
          buffer = await generateJSON(data);
          break;
        case 'csv':
          buffer = await generateCSV(data);
          break;
        case 'sqlite':
          buffer = await generateSQLite(data);
          break;
        default:
          return res.status(400).json({ error: 'Formato inválido' });
      }

      // Cache result
      cache.set(format, { buffer, generatedAt: new Date(), counts });

      return sendFile(res, format, buffer);
    } catch (error) {
      console.error('Error generating open data export:', error);
      res.status(500).json({ error: 'Error al generar la exportación' });
    }
  });

  // GET /api/open-data/schema — field descriptions
  app.get('/api/open-data/schema', (_req, res) => {
    res.json({
      suenos: {
        description: 'Sueños, valores, necesidades y declaraciones ¡Basta! del mapa colectivo',
        fields: {
          exportId: 'ID secuencial del registro en la exportación',
          dream: 'Texto del sueño declarado',
          value: 'Valor personal declarado',
          need: 'Necesidad declarada',
          basta: 'Declaración ¡Basta! — lo que ya no se tolera',
          type: 'Tipo de declaración: dream, value, need, basta',
          location: 'Ubicación en texto libre',
          latitude: 'Latitud geográfica',
          longitude: 'Longitud geográfica',
          createdAt: 'Fecha de creación',
        },
      },
      compromisos: {
        description: 'Compromisos públicos de acción asumidos por la comunidad',
        fields: {
          exportId: 'ID secuencial del registro en la exportación',
          commitmentText: 'Texto del compromiso',
          commitmentType: 'Tipo: initial, intermediate, public',
          province: 'Provincia',
          city: 'Ciudad',
          latitude: 'Latitud geográfica',
          longitude: 'Longitud geográfica',
          createdAt: 'Fecha de creación',
        },
      },
      recursos: {
        description: 'Recursos declarados por la comunidad: habilidades, tiempo, espacios, equipamiento',
        fields: {
          exportId: 'ID secuencial del registro en la exportación',
          description: 'Descripción del recurso ofrecido',
          category: 'Categoría: legal, medical, education, tech, construction, agriculture, communication, admin, transport, space, equipment, other',
          availableHours: 'Horas disponibles por semana',
          latitude: 'Latitud geográfica',
          longitude: 'Longitud geográfica',
          location: 'Ubicación en texto libre',
          province: 'Provincia',
          city: 'Ciudad',
          isActive: 'Si el recurso está activo',
          createdAt: 'Fecha de creación',
        },
      },
    });
  });
}

function sendFile(res: any, format: string, buffer: Buffer) {
  const stamp = dateStamp();
  switch (format) {
    case 'json':
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="datos-abiertos-${stamp}.json"`);
      break;
    case 'csv':
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="datos-abiertos-${stamp}.zip"`);
      break;
    case 'sqlite':
      res.setHeader('Content-Type', 'application/x-sqlite3');
      res.setHeader('Content-Disposition', `attachment; filename="datos-abiertos-${stamp}.sqlite"`);
      break;
  }
  res.send(buffer);
}
