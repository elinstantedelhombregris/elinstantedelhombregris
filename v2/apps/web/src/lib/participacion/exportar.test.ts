import { beforeEach, describe, expect, it, vi } from 'vitest';

import { aCsv, celdaCsv, filtrosPublicos, paqueteZip, reunirRegistro } from './exportar';

import type { ManifiestoExportacion } from '@v2/shared';

import { api } from '~/lib/api';
vi.mock('~/lib/api', () => ({ api: { get: vi.fn() } }));
const manifest: ManifiestoExportacion = {
  esquema: 'basta-registro-publico/v1',
  generadoEn: '2026-10-08T00:00:00.000Z',
  corte: '2026-10-08T00:00:00.000Z',
  alcance: 'Prueba',
  completo: false,
  conteos: { elegibles: 2, entregados: 1, textosReservados: 0 },
  filtros: {},
  omisiones: [],
  licencias: { compilacion: 'CC BY 4.0', textos: 'CC BY 4.0' },
  metodo: 'Consulta pública',
  sha256: 'abc',
};
describe('Archivos públicos completos y seguros', () => {
  beforeEach(() => vi.clearAllMocks());
  it('CSV conserva comillas y evita ejecutar fórmulas incluyendo espacios iniciales', () => {
    expect(celdaCsv(' =WEBSERVICE("x")')).toBe('"\' =WEBSERVICE(""x"")"');
    expect(celdaCsv(23)).toBe('"23"');
    expect(celdaCsv(null)).toBe('""');
    expect(aCsv([])).toContain('id,tipo,clase');
  });
  it('solo envía filtros públicos; no filtra por secretos ni guarda relatos', () => {
    expect(
      filtrosPublicos({
        campana: 'c',
        umbral: '.7',
        texto: 'privado',
        token: 'secreto',
        tema: 'educación',
      }),
    ).toEqual({ campana: 'c', tema: 'educación' });
  });
  it('el ZIP preserva UTF8 y directorio central con tamaños y CRC', async () => {
    const blob = paqueteZip([{ nombre: 'LEEME.txt', contenido: 'El país que imaginás.' }]);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint16(6, true)).toBe(0x800);
    const tam = view.getUint32(18, true);
    const inicio = 30 + view.getUint16(26, true);
    expect(new TextDecoder().decode(bytes.slice(inicio, inicio + tam))).toBe(
      'El país que imaginás.',
    );
    expect(view.getUint32(inicio + tam, true)).toBe(0x02014b50);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(bytes.length - 12, true)).toBe(1);
  });
  it('pagina hasta el final conservando corte y calcula el manifiesto completo', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        registros: [{ id: 'uno' }],
        total: 2,
        siguiente: 'uno',
        manifiesto: manifest,
      })
      .mockResolvedValueOnce({
        registros: [{ id: 'dos' }],
        total: 2,
        siguiente: null,
        manifiesto: manifest,
      });
    const progreso = vi.fn();
    const datos = await reunirRegistro(
      { tema: 'educación' },
      new AbortController().signal,
      progreso,
    );
    expect(datos.registros).toHaveLength(2);
    expect(datos.manifiesto.completo).toBe(true);
    expect(datos.manifiesto.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(vi.mocked(api.get).mock.calls[1]?.[0]).toContain('corte=2026');
    expect(progreso).toHaveBeenLastCalledWith(2, 2);
  });
  it('un cursor repetido o un corte cambiante jamás se anuncia completo', async () => {
    vi.mocked(api.get).mockResolvedValue({
      registros: [],
      total: 2,
      siguiente: 'repetido',
      manifiesto: manifest,
    });
    await expect(reunirRegistro({}, new AbortController().signal, () => undefined)).rejects.toThrow(
      'continuación',
    );
    vi.mocked(api.get)
      .mockReset()
      .mockResolvedValueOnce({ registros: [], total: 2, siguiente: 'a', manifiesto: manifest })
      .mockResolvedValueOnce({
        registros: [],
        total: 2,
        siguiente: null,
        manifiesto: { ...manifest, corte: '2026-10-09T00:00:00.000Z' },
      });
    await expect(reunirRegistro({}, new AbortController().signal, () => undefined)).rejects.toThrow(
      'corte cambió',
    );
  });
});
