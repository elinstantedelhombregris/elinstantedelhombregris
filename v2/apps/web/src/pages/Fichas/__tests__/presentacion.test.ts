import { estadosPrueba } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import {
  ESTADOS_PRUEBA,
  RELACIONES,
  RELACION_INICIAL,
  TITULOS_DE_DISENO,
  VISTAS_DE_DISENO,
  cantidadDe,
  enLista,
  esRelacion,
  esUuid,
  etiquetaVersion,
  faltanCaracteres,
  fechaDeFicha,
  leerVista,
  nombreDeCampo,
  numeroDeLugar,
  rotuloDePrueba,
} from '../presentacion';

describe('Fichas: lo que se dice en pantalla', () => {
  it('las cinco relaciones se leen en castellano y una aspiración nunca se etiqueta como descripción', () => {
    expect(RELACIONES).toEqual({
      describe: 'Describe la situación',
      contradice: 'Contradice la lectura',
      evidencia: 'Aporta evidencia',
      capacidad: 'Aporta una capacidad',
      inspira: 'Inspira el futuro deseado',
    });
    expect(RELACION_INICIAL).toBe('inspira');
    expect(esRelacion('inspira')).toBe(true);
    expect(esRelacion('toString')).toBe(false);
  });

  it('la versión de una ficha se dice «Ficha abierta · versión n»', () => {
    expect(etiquetaVersion(3)).toBe('Ficha abierta · versión 3');
  });

  it('todos los pasos de una prueba tienen su nombre, y uno desconocido no se muestra crudo', () => {
    for (const estado of estadosPrueba) expect(ESTADOS_PRUEBA[estado]).not.toMatch(/_/);
    expect(Object.keys(ESTADOS_PRUEBA).sort()).toEqual([...estadosPrueba].sort());
    expect(rotuloDePrueba('en_curso')).toBe('En curso');
    expect(rotuloDePrueba('inventado_x')).toBe('Paso sin nombre');
  });

  it('el historial nombra los campos como los lee quien edita, nunca por su clave', () => {
    expect(nombreDeCampo('vinculos')).toBe('vínculos');
    expect(nombreDeCampo('proximaTarea')).toBe('próxima tarea');
    expect(nombreDeCampo('territorioId')).toBe('lugar');
    expect(nombreDeCampo('creación')).toBe('creación de la ficha');
    expect(nombreDeCampo('algoNuevo')).toBe('otro campo');
  });

  it('una fecha con hora sale como día en castellano', () => {
    expect(fechaDeFicha('2026-10-15T12:00:00.000Z')).toMatch(/octubre de 2026/);
    expect(fechaDeFicha('no es una fecha')).toBe('no es una fecha');
  });

  it('los números se dicen con su plural y el cero, en palabras si se pide', () => {
    expect(cantidadDe(1, 'ficha', 'fichas')).toBe('1 ficha');
    expect(cantidadDe(12, 'ficha', 'fichas')).toBe('12 fichas');
    expect(cantidadDe(0, 'acuerdo', 'acuerdos', 'ningún acuerdo')).toBe('ningún acuerdo');
    expect(cantidadDe(0, 'acuerdo', 'acuerdos')).toBe('0 acuerdos');
    expect(enLista(['vínculos'])).toBe('vínculos');
    expect(enLista(['vínculos', 'próxima tarea'])).toBe('vínculos y próxima tarea');
    expect(enLista(['a', 'b', 'c'])).toBe('a, b y c');
  });

  it('dice cuánto falta para llegar a un mínimo', () => {
    expect(faltanCaracteres(0, 10)).toBe('Faltan 10 caracteres.');
    expect(faltanCaracteres(9, 10)).toBe('Falta 1 carácter.');
    expect(faltanCaracteres(4, 15, 'en lo que observamos')).toBe(
      'Faltan 11 caracteres en lo que observamos.',
    );
    expect(faltanCaracteres(10, 10)).toBeNull();
  });

  it('las pestañas y los títulos de la conversación son las mismas frases', () => {
    expect(VISTAS_DE_DISENO.map((v) => TITULOS_DE_DISENO[v])).toEqual([
      'Afirmaciones para conversar',
      'Alternativas para comparar',
      'Pruebas chicas para aprender',
    ]);
    expect(leerVista('pruebas')).toBe('pruebas');
    expect(leerVista('conversar')).toBe('afirmaciones');
    expect(leerVista(null)).toBe('afirmaciones');
  });

  it('lee con cuidado lo que viene en la dirección', () => {
    expect(numeroDeLugar('13')).toBe(13);
    expect(numeroDeLugar('-1')).toBeUndefined();
    expect(numeroDeLugar('abc')).toBeUndefined();
    expect(numeroDeLugar(null)).toBeUndefined();
    expect(esUuid('3718dc73-9774-4d3b-b23d-8bf290ffec30')).toBe(true);
    expect(esUuid('mi-argentina-ideal')).toBe(false);
    expect(esUuid(null)).toBe(false);
  });
});
