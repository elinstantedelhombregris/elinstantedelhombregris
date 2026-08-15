import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit reads env from CWD; ensure we honor v2/.env when running
// from a workspace package. The unpooled URL is preferred for migrations
// (pooled connections sometimes mis-handle long-running DDL).
config({ path: new URL('../../.env', import.meta.url).pathname });

const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required for drizzle-kit');
}

export default defineConfig({
  out: './migrations',
  // List individual schema files. drizzle-kit runs in CJS and chokes
  // on the `.js`-suffixed ESM-relative imports inside index.ts, so we
  // bypass the barrel here and add new files explicitly when domains
  // are introduced.
  schema: [
    './src/schema/users.ts',
    './src/schema/auth.ts',
    './src/schema/notifications.ts',
    './src/schema/geographic.ts',
    './src/schema/geo-calles.ts',
    './src/schema/geo-seed.ts',
    './src/schema/community.ts',
    './src/schema/blog.ts',
    './src/schema/ensayos.ts',
    './src/schema/civic-assessment.ts',
    './src/schema/goals.ts',
    './src/schema/coaching.ts',
    './src/schema/resources.ts',
    './src/schema/dreams.ts',
    './src/schema/feedback.ts',
    './src/schema/courses.ts',
    './src/schema/iniciativas.ts',
    './src/schema/mandato.ts',
    './src/schema/pulso.ts',
    './src/schema/gamification.ts',
    './src/schema/life-areas.ts',
    './src/schema/semillas.ts',
    './src/schema/faltas.ts',
    './src/schema/analisis.ts',
    // La señal y su vocabulario. `_catalogos.ts` va PRIMERO de los cuatro: las
    // dos FK compuestas de `senales` no se pueden crear antes que las tablas a
    // las que apuntan.
    './src/schema/_catalogos.ts',
    './src/schema/actores.ts',
    './src/schema/senales.ts',
    './src/schema/confirmaciones.ts',
    './src/schema/adhesiones.ts',
    // El esquema `simulacion` — la siembra sintética, físicamente aparte de
    // `public`. Va acá y NO en `schema/index.ts` a propósito: drizzle-kit tiene
    // que verlo para generar la migración, pero el cliente que sirve la API no
    // tiene que poder nombrarlo. Ver la cabecera de `simulacion-esquema.ts`.
    './src/schema/simulacion-esquema.ts',
    './src/schema/simulacion-elenco.ts',
    './src/schema/simulacion-corrida.ts',
    './src/schema/simulacion-ensayo.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
