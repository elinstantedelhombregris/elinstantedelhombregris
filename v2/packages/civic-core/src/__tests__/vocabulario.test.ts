import { describe, expect, it } from 'vitest';

import { TIPOS_CON_TECHO_DE_DIRECCION, techoDeTipo } from '../direcciones.js';
import {
  CLASES_SENAL,
  CLASE_DE_TIPO,
  claseDe,
  esVerificable,
  leerClase,
  leerTipo,
  TIPOS_POR_CLASE,
  TIPOS_SENAL,
} from '../senal/vocabulario.js';

/**
 * El canon: nueve tipos en cuatro clases, y `valor` no está.
 *
 * La lista se escribe acá **a mano y completa**, independiente de la del
 * módulo: una constante derivada de la cosa que verifica no verifica nada sola.
 */
const LOS_NUEVE = [
  'basta',
  'necesidad',
  'recurso',
  'práctica',
  'saber',
  'sueño',
  'propuesta',
  'compromiso',
  'pregunta',
];

describe('el vocabulario canónico', () => {
  it('son nueve tipos, y en el orden del canon', () => {
    expect([...TIPOS_SENAL]).toEqual(LOS_NUEVE);
  });

  it('`valor` NO es un tipo: salió del mapa y no se traduce a nada', () => {
    expect(TIPOS_SENAL).not.toContain('valor');
    expect(leerTipo('valor')).toEqual({ reconocido: false, crudo: 'valor' });
  });

  it('son cuatro clases y cada tipo tiene exactamente una', () => {
    expect([...CLASES_SENAL]).toEqual(['hecho', 'deseo', 'acto', 'meta']);
    for (const tipo of TIPOS_SENAL) {
      expect(CLASES_SENAL).toContain(claseDe(tipo));
    }
    expect(Object.keys(CLASE_DE_TIPO).sort()).toEqual([...TIPOS_SENAL].sort());
  });

  it('la clasificación es la del canon, tipo por tipo', () => {
    expect(TIPOS_POR_CLASE.hecho).toEqual(['basta', 'necesidad', 'recurso', 'práctica', 'saber']);
    expect(TIPOS_POR_CLASE.deseo).toEqual(['sueño', 'propuesta']);
    expect(TIPOS_POR_CLASE.acto).toEqual(['compromiso']);
    expect(TIPOS_POR_CLASE.meta).toEqual(['pregunta']);
  });

  it('sólo hecho y acto se corroboran — regla 11', () => {
    expect(esVerificable('hecho')).toBe(true);
    expect(esVerificable('acto')).toBe(true);
    // Un deseo se delibera, y la deliberación no está construida (§8.3).
    expect(esVerificable('deseo')).toBe(false);
    // Una meta se responde, que es otra cosa.
    expect(esVerificable('meta')).toBe(false);
  });

  it('coincide con la otra lista de nueve que ya vivía en el repo', () => {
    // `direcciones.ts` las tenía como claves de `TECHO_POR_TIPO` con un TODO
    // pidiendo tiparlas contra un `TipoDeSenal` que no existía. Ahora el
    // `satisfies` lo garantiza en compilación; esto lo verifica en ejecución,
    // que es donde se nota si alguien afloja el tipo.
    expect([...TIPOS_CON_TECHO_DE_DIRECCION].sort()).toEqual([...TIPOS_SENAL].sort());
    for (const tipo of TIPOS_SENAL) {
      expect(techoDeTipo(tipo).reconocido).toBe(true);
    }
  });

  it('lee la ñ y la tilde vengan como vengan: NFC o NFD', () => {
    const nfd = 'práctica'.normalize('NFD');
    expect(nfd).not.toBe('práctica');
    expect(leerTipo(nfd)).toEqual({ reconocido: true, tipo: 'práctica' });
    expect(leerTipo('  SUEÑO  ')).toEqual({ reconocido: true, tipo: 'sueño' });
  });

  it('lo que no reconoce lo devuelve crudo, sin sumidero', () => {
    // El `?? 'valor'` que todavía vive en tres archivos de la web es
    // exactamente esto hecho mal: todo lo que no matchea se pliega a un tipo
    // real y la composición medida queda sesgada por construcción.
    expect(leerTipo('cualquier cosa')).toEqual({ reconocido: false, crudo: 'cualquier cosa' });
    expect(leerTipo('')).toEqual({ reconocido: false, crudo: '' });
    expect(leerClase('hecho')).toEqual({ reconocido: true, clase: 'hecho' });
    expect(leerClase('valor')).toEqual({ reconocido: false, crudo: 'valor' });
  });
});
