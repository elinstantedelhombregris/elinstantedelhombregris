import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Cada página principal le pone nombre a la pestaña con `useTituloDePagina`.
 *
 * Es una guarda de código y no un render por página: montar Home, el mapa o la Radiografía
 * pide media aplicación de mocks, y lo que se quiere asegurar es solo que ninguna se quede
 * sin título (que es lo que pasa cuando alguien crea una página nueva copiando otra).
 * El comportamiento del hook lo prueba `lib/__tests__/titulo-de-pagina.test.tsx`.
 */
const PAGINAS = join(dirname(fileURLToPath(import.meta.url)), '..');

const TITULOS: readonly (readonly [archivo: string, titulo: string])[] = [
  ['Home.tsx', "'Inicio'"],
  ['ElMapa.tsx', "participando && modoAporte === 'guiado' ? 'Imaginar mi Argentina' : 'El mapa'"],
  ['LaRadiografia.tsx', "'La Radiografía'"],
  ['Campanas.tsx', "'Campañas'"],
  ['CampanaDetail.tsx', "q.data?.contrato.titulo ?? 'Campaña'"],
  ['Fichas/ListaFichas.tsx', "'Fichas'"],
  ['Fichas/NuevaFicha.tsx', "'Crear una ficha'"],
  ['Fichas/DetalleFicha.tsx', "detalle.data?.contenido.titulo ?? 'Ficha'"],
  ['MiEspacio.tsx', "'Mi espacio'"],
  ['Login.tsx', "'Ingresar'"],
  ['Register.tsx', "'Crear mi cuenta'"],
  ['Fuentes.tsx', "'Fuentes y geografía'"],
  ['DatosAbiertos.tsx', "'Datos abiertos'"],
  ['ElMandatoVivo.tsx', "'El mandato vivo'"],
  ['LaIdea.tsx', "'La idea'"],
  ['Planes.tsx', "'Planes'"],
  ['Biblioteca.tsx', "'Biblioteca'"],
];

describe('las páginas principales nombran la pestaña', () => {
  it.each(TITULOS)('%s', (archivo, titulo) => {
    const codigo = readFileSync(join(PAGINAS, archivo), 'utf8');
    expect(codigo).toContain(`useTituloDePagina(${titulo})`);
    expect(codigo).toContain("from '~/lib/titulo-de-pagina'");
  });
});
