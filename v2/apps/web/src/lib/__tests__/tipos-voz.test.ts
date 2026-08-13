import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLASES_SENAL, leerTipo, TIPOS_SENAL } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { leerTipoVoz, TIPO_PARA_LO_QUE_NO_ESTA_EN_LA_PALETA, tipoParaPintar, TIPOS_VOZ } from '../tipos-voz';

/**
 * La paleta de la web contra el canon del núcleo.
 *
 * Este archivo afirmaba que las dos listas eran **la misma lista en el mismo
 * orden**, contra un `TIPOS_VOZ_CIVICOS` que vivía en `civic-core` y que ningún
 * cálculo leía. Esa guarda protegía la sincronía de un vocabulario muerto: los
 * seis con `valor` adentro. Mientras estuvo verde, parecía que no faltaba nada.
 *
 * Ahora dice la verdad, que es más incómoda y más útil: **son dos listas
 * distintas**, y acá está escrito cuánto falta para que sean una.
 */
describe('la paleta de la web y el canon del núcleo', () => {
  it('no son la misma lista, y lo que falta está enumerado', () => {
    // Lo que la web ofrece y el canon NO tiene. `valor` salió del mapa a
    // propósito: un valor no tiene coordenada. Migrarlo reparte su peso y lo
    // dice; no se pliega en silencio contra otro tipo.
    const sobranEnLaWeb = TIPOS_VOZ.filter((t) => !TIPOS_SENAL.some((c) => c === t));
    expect(sobranEnLaWeb).toEqual(['valor']);

    // Lo que el canon tiene y la web todavía no sabe dibujar: no tienen color,
    // ni rótulo, ni placeholder, y `dreams.category` no los escribió nunca.
    const faltanEnLaWeb = TIPOS_SENAL.filter((c) => !TIPOS_VOZ.some((t) => t === c));
    expect([...faltanEnLaWeb].sort()).toEqual(['pregunta', 'propuesta', 'práctica', 'saber']);

    // Y las clases, que son el eje de la palanca, no tienen ninguna presencia
    // en la paleta: la web pinta tipos, el motor cuenta clases.
    expect(CLASES_SENAL).toEqual(['hecho', 'deseo', 'acto', 'meta']);
  });

  it('leer no pliega: lo que no está en la paleta vuelve crudo', () => {
    expect(leerTipoVoz('basta')).toEqual({ reconocido: true, tipo: 'basta' });
    expect(leerTipoVoz('práctica')).toEqual({ reconocido: false, crudo: 'práctica' });
    expect(leerTipoVoz(null)).toEqual({ reconocido: false, crudo: '' });
  });

  it('pintar sí pliega, y es el único lugar donde eso pasa', () => {
    expect(tipoParaPintar('sueño')).toBe('sueño');
    expect(tipoParaPintar('cualquier cosa')).toBe(TIPO_PARA_LO_QUE_NO_ESTA_EN_LA_PALETA);
    expect(tipoParaPintar(null)).toBe(TIPO_PARA_LO_QUE_NO_ESTA_EN_LA_PALETA);
    // Y el canon no pliega ni para pintar: son dos funciones con dos contratos.
    expect(leerTipo('cualquier cosa')).toEqual({ reconocido: false, crudo: 'cualquier cosa' });
  });
});

/**
 * La guarda del vocabulario muerto.
 *
 * `?? 'valor'` vivía copiado en cuatro archivos de la web —`el-mapa-data.ts`,
 * `paleta.ts`, `mandato-regimen.ts` y `VocesTicker.tsx`—. Cuatro copias de un
 * default es cómo un vocabulario muerto sobrevive dos años: para migrarlo hay
 * que encontrarlas todas, y la que no se encuentre sigue plegando en silencio.
 *
 * Esta guarda no cuenta ocurrencias de una cadena: **compila la regla**. El
 * pliegue tiene un solo dueño, y cualquier archivo que se escriba el suyo lo
 * dice acá antes de que llegue a producción.
 */
describe('el pliegue tiene un solo dueño', () => {
  const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const DUENIO = join(SRC, 'lib', 'tipos-voz.ts');

  /** Los comentarios se descartan: lo que se audita es el código, no la prosa. */
  const sinComentarios = (fuente: string): string =>
    fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  const archivosDeFuente = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
      const ruta = join(dir, entrada.name);
      if (entrada.isDirectory()) return entrada.name === '__tests__' ? [] : archivosDeFuente(ruta);
      return /\.tsx?$/.test(entrada.name) ? [ruta] : [];
    });

  it('ningún archivo se escribe su propio default de tipo', () => {
    const culpables = archivosDeFuente(SRC)
      .filter((ruta) => ruta !== DUENIO)
      .filter((ruta) => /\?\?\s*'valor'/.test(sinComentarios(readFileSync(ruta, 'utf8'))));

    expect(culpables).toEqual([]);
  });
});
