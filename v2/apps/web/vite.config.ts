import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

import { htmlConVistaPrevia, imagenDeVistaPrevia, leerCabecera } from './src/lib/vista-previa';

/**
 * Al terminar el build, una copia de `index.html` por crónica en `bitacora/<slug>/index.html`,
 * con su título, su resumen y su portada en el `<head>`: lo que leen WhatsApp y X al armar la
 * vista previa de un enlace (D-149). El porqué y las reglas están en `src/lib/vista-previa.ts`.
 */
function vistasPrevias(): Plugin {
  const blog = fileURLToPath(new URL('../../content/blog/', import.meta.url));
  const dist = fileURLToPath(new URL('./dist/', import.meta.url));
  return {
    name: 'vistas-previas-de-cronicas',
    apply: 'build',
    closeBundle() {
      const index = readFileSync(join(dist, 'index.html'), 'utf8');
      let escritas = 0;
      for (const archivo of readdirSync(blog).filter((a) => a.endsWith('.mdx'))) {
        const c = leerCabecera(readFileSync(join(blog, archivo), 'utf8'));
        if (!c || c.borrador || !/^[a-z0-9-]+$/.test(c.slug)) continue;
        const imagen = imagenDeVistaPrevia(c.portada, (ruta) => existsSync(join(dist, ruta)));
        const destino = join(dist, 'bitacora', c.slug);
        mkdirSync(destino, { recursive: true });
        writeFileSync(join(destino, 'index.html'), htmlConVistaPrevia(index, c, imagen));
        escritas += 1;
      }
      if (escritas === 0) throw new Error('vistas-previas: no se escribió ninguna crónica');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('../../', import.meta.url)), '');

  return {
    plugins: [react(), vistasPrevias()],
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
            // Compartido por las escenas de crónica y el retrato de bienvenida.
            // Ambos se cargan con import() fuera del paquete inicial (ADR 0011 y 0013).
            three: ['three'],
          },
        },
      },
    },
  };
});
