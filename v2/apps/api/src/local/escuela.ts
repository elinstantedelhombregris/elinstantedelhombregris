/** Entrada exclusiva del ensayo. No importar desde index.ts ni desde el bundle de producción. */
import { comprobarEntornoEscolar } from './escuela-guardia.js';

comprobarEntornoEscolar(process.env);
const { puentearNeonAPostgresLocal } = await import('@v2/db/testing/neon-local');
const cerrarBase = puentearNeonAPostgresLocal(process.env.DATABASE_URL ?? '');
const { default: express } = await import('express');
const { createApp } = await import('../app.js');
const { logger } = await import('../lib/logger.js');
const { sembrarEscuela } = await import('./escuela-sembrar.js');
const { CUENTAS_ESCOLARES, CLAVE_ESCOLAR } = await import('./escuela-contenido.js');
const app = express();
let ensayo: Awaited<ReturnType<typeof sembrarEscuela>> | null = null;
app.get('/api/local/escuela', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!ensayo) {
    res.status(503).json({ error: { message: 'Preparando el ensayo local.' } });
    return;
  }
  res.json({ data: { ...ensayo, cuentas: CUENTAS_ESCOLARES, clave: CLAVE_ESCOLAR } });
});
app.use(createApp());
const server = app.listen(4000, '127.0.0.1');
server.on('error', (err) => {
  logger.error({ err }, 'No se pudo abrir la API del ensayo');
  process.exit(1);
});
await new Promise<void>((resolve) => server.once('listening', resolve));
try {
  ensayo = await sembrarEscuela();
  logger.info(
    { recorrido: 'http://127.0.0.1:4179/recorridos/llegar-a-tiempo-a-la-escuela' },
    'Ensayo listo; API y base locales, progreso persistente',
  );
} catch (err) {
  logger.error({ err }, 'No se pudo preparar el ensayo escolar');
  server.closeAllConnections();
  server.close();
  await cerrarBase();
  process.exit(1);
}
for (const signal of ['SIGTERM', 'SIGINT'])
  process.once(signal, () => {
    server.closeAllConnections();
    server.close(() => {
      void cerrarBase().then(() => process.exit(0));
    });
  });
