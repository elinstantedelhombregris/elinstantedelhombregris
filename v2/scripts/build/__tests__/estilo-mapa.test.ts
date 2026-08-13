/**
 * El estilo publicado tiene que ser un estilo válido de maplibre.
 *
 * Es la verificación que más barata resultó y más caro habría salido no tener.
 * Un estilo inválido **no degrada**: maplibre lo rechaza entero y no dibuja
 * nada, ni el fondo, ni un error de red que mirar. Pasó mientras se escribía
 * esta misma tarea — ocho `text-font` puestos como array pelado adentro de un
 * `["format", …]`, donde esa forma se lee como una llamada a función — y el
 * mapa quedó en negro.
 *
 * `generar-estilo.ts` valida antes de escribir, así que este test no protege
 * contra el generador: protege contra la mano que edite `oscuro.json` a pesar
 * del cartel que dice que no lo edite.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';

import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const estilo = JSON.parse(
  readFileSync(resolve(RAIZ, 'apps/web/public/maps/oscuro-propio.json'), 'utf8'),
) as StyleSpecification;

describe('apps/web/public/maps/oscuro-propio.json', () => {
  it('valida contra la spec de maplibre', () => {
    const errores = validateStyleMin(estilo).map((e) => e.message);
    expect(errores).toEqual([]);
  });

  it('dibuja las huellas de edificio en zoom alto — decisión del dueño, 12/8/2026', () => {
    // El archivo de teselas se extrajo hasta z15 para traerlas. Si alguien
    // apaga esta capa, ese medio giga pasa a ser peso muerto: la decisión del
    // zoom máximo y esta capa son la misma decisión.
    const manzanas = estilo.layers.find((c) => c.id === 'buildings');
    expect(manzanas).toBeDefined();
    expect(JSON.stringify(manzanas)).toContain('fill-opacity');
    expect(manzanas).toMatchObject({ minzoom: 14 });
  });

  it('no dibuja POIs ni numeración de casas', () => {
    const ids = estilo.layers.map((c) => c.id);
    expect(ids).not.toContain('pois');
    expect(ids).not.toContain('address_label');
  });

  it('no declara sprite, y por lo tanto ninguna capa pide iconos', () => {
    expect('sprite' in estilo).toBe(false);
    expect(JSON.stringify(estilo.layers)).not.toContain('icon-image');
  });
});
