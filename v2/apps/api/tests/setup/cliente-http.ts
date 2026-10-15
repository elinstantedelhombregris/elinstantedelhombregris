import { createServer, type RequestListener } from 'node:http';
import supertest from 'supertest';
import { afterAll, beforeAll } from 'vitest';

/**
 * Un servidor por suite: Supertest no lo abre y cierra entre peticiones.
 * Evita reutilizar puertos y sockets mientras una respuesta anterior termina.
 * No hay reintentos ni alteración de respuestas; los handlers y Postgres son reales.
 * Contexto: https://github.com/forwardemail/supertest/issues/844
 */
export function clienteHttp(app: RequestListener) {
  const servidor = createServer(app);
  beforeAll(
    () =>
      new Promise<void>((resolve, reject) => {
        servidor.once('error', reject);
        servidor.listen(0, '127.0.0.1', () => {
          servidor.removeListener('error', reject);
          resolve();
        });
      }),
  );
  afterAll(
    () =>
      new Promise<void>((resolve, reject) => {
        if (!servidor.listening) {
          resolve();
          return;
        }
        servidor.close((error) => (error ? reject(error) : resolve()));
        servidor.closeAllConnections();
      }),
  );
  return supertest(servidor);
}
