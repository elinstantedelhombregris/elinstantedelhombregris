import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('../../', import.meta.url)), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(env.WEB_PORT ?? 5173),
      strictPort: true,
      proxy: {
        '/api': {
          target: env.PUBLIC_API_URL ?? 'http://localhost:4000',
          changeOrigin: true,
          /**
           * Borrar `Origin` al reenviar. **Sin esto, todo POST del sitio en
           * desarrollo devuelve 500 apenas Vite arranca en un puerto que no
           * está en `CORS_ORIGINS`** — y `.claude/launch.json` tiene
           * `autoPort: true`, así que eso pasa cada vez que hay dos sesiones
           * y la segunda cae en un puerto de respaldo.
           *
           * `changeOrigin` no alcanza: reescribe `Host`, no `Origin`. Y para
           * el navegador la petición **es** del mismo origen —va a
           * `/api/...` de su propia página—; el que la hace ver cruzada es
           * este proxy al reenviar la cabecera. Borrarla deja al servidor
           * viendo lo que la situación es de verdad, que es exactamente el
           * caso «sin Origin» que `security.ts` ya trata como propio.
           *
           * Sólo afecta a `vite dev`. En producción no hay proxy: el sitio y
           * la API comparten origen (ADR 0008) y `CORS_ORIGINS` sigue siendo
           * la única puerta.
           */
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            query: ['@tanstack/react-query'],
            radix: ['@radix-ui/react-slot'],
          },
        },
      },
    },
  };
});
