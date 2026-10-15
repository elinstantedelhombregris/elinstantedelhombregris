import { describe, expect, it } from 'vitest';

import { comprobarDestino, comprobarDiario } from '../../scripts/migraciones-seguras.js';

const host = 'ep-flat-art-ajjmw0zc.c-3.us-east-2.aws.neon.tech';
const ultima = '0039_sintesis_nacional';
const remoto = `postgresql://usuario:secreto@${host}/neondb`;
const local = { sql: ['SELECT 1'], folderMillis: 123, hash: 'abc', bps: true };

describe('Migraciones con destino explícito', () => {
  it('no carga .env ni admite otro destino remoto', () => {
    expect(() => comprobarDestino(undefined, [], ultima)).toThrow('explícitamente');
    expect(() =>
      comprobarDestino('postgresql://usuario@otro.neon.tech/neondb', ['--aplicar'], ultima),
    ).toThrow('no es la base v2');
    expect(() => comprobarDestino(remoto, [], ultima)).toThrow('--remoto');
    expect(() =>
      comprobarDestino(remoto, [`--remoto=${host}`, `--hasta=${ultima}`], ultima),
    ).toThrow('--aplicar');
  });
  it('admite comprobación remota sin aplicar y ejecución local explícita', () => {
    expect(
      comprobarDestino(remoto, [`--remoto=${host}`, `--hasta=${ultima}`, '--comprobar'], ultima)
        .comprobar,
    ).toBe(true);
    expect(comprobarDestino('postgresql://postgres@127.0.0.1/prueba', [], ultima).host).toBe(
      '127.0.0.1',
    );
    expect(
      comprobarDestino(remoto, [`--remoto=${host}`, `--hasta=${ultima}`, '--aplicar'], ultima).base,
    ).toBe('neondb');
  });
  it('rechaza diarios alterados, con huecos o adelantados', () => {
    expect(comprobarDiario([], [local])).toEqual([local]);
    expect(comprobarDiario([{ hash: 'abc', created_at: '123' }], [local])).toEqual([]);
    expect(() => comprobarDiario([{ hash: 'otro', created_at: '123' }], [local])).toThrow(
      'difiere',
    );
    expect(() => comprobarDiario([{ hash: 'abc', created_at: '124' }], [local])).toThrow('difiere');
    expect(() => comprobarDiario([{ hash: 'abc', created_at: '123' }], [])).toThrow('no están');
    expect(() => comprobarDiario([], [local, { ...local, folderMillis: 122 }])).toThrow(
      'crecientes',
    );
  });
});
