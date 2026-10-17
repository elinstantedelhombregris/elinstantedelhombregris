import { expect, it } from 'vitest';

import { comprobarEntornoEscolar } from '../escuela-guardia.js';

const entorno = {
  DATABASE_URL: 'postgresql://postgres@127.0.0.1:55441/basta_escuela_local',
  DATABASE_URL_UNPOOLED: 'postgresql://postgres@127.0.0.1:55441/basta_escuela_local',
  NODE_ENV: 'development',
  API_PORT: '4000',
  PUBLIC_WEB_URL: 'http://127.0.0.1:4179',
};
it('acepta solamente el destino aislado y bloquea conexiones o proveedores heredados', () => {
  expect(() => {
    comprobarEntornoEscolar(entorno);
  }).not.toThrow();
  for (const cambio of [
    { DATABASE_URL: 'postgresql://postgres@remote.example/basta_escuela_local' },
    { DATABASE_URL_UNPOOLED: 'postgresql://postgres@remote.example/otra' },
    { DATABASE_URL: entorno.DATABASE_URL + '_otra' },
    { NODE_ENV: 'production' },
    { GROQ_API_KEY: 'externa' },
    { RESEND_API_KEY: 'externa' },
    { AWS_ACCESS_KEY_ID: 'externa' },
  ])
    expect(() => {
      comprobarEntornoEscolar({ ...entorno, ...cambio });
    }).toThrow();
});
