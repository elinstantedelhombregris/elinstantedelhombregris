import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { GEOGRAFIA } from '../../../packages/shared/src/datos/geografia.js';
import { VALIDACION_ESPACIAL, informeEspacialSchema } from '../../../packages/shared/src/datos/validacion-espacial.js';
import { comprobarPoligonos } from '../geo/control-espacial.js';
import { publicarAuditoria } from '../geo/publicar-auditoria.js';
import { publicarGeografia } from '../geo/publicar-geografia.js';

vi.mock('../geo/control-espacial.js', () => ({ comprobarPoligonos: vi.fn() }));
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
const texto = readFileSync(join(raiz, 'apps/web/public', VALIDACION_ESPACIAL.archivo), 'utf8');
const informe = informeEspacialSchema.parse(JSON.parse(texto));
const temporales: string[] = [];
afterEach(() => { vi.resetAllMocks(); for (const p of temporales.splice(0)) rmSync(p, { recursive: true, force: true }); });
const temporal = () => { const p = mkdtempSync(join(tmpdir(), 'geo-control-')); temporales.push(p); return p; };

describe('Auditoría ligada a archivos exactos', () => {
  it('la edición publicada y cada incidencia tienen referencias comprobables', () => {
    expect(createHash('sha256').update(texto).digest('hex')).toBe(VALIDACION_ESPACIAL.sha256);
    expect(informe.version).toBe(GEOGRAFIA.version);
    for (const c of GEOGRAFIA.capas) {
      expect(informe.fuentes.find(f => f.nombre === c.nombre)?.sha256).toBe(c.sha256);
      const capa = JSON.parse(readFileSync(join(raiz, 'apps/web/public', c.archivo), 'utf8')) as { features: { properties: { georefId: string | null; name: string } }[] };
      const resumen = informe.capas.find(r => r.nombre === c.nombre);
      expect(resumen?.rasgos).toBe(capa.features.length);
      expect(resumen?.incidencias).toBe(informe.incidencias.filter(i => i.capa === c.nombre).length);
      for (const i of informe.incidencias.filter(i => i.capa === c.nombre)) {
        // Fuera de provincia y cobertura incluyen una referencia a la capa padre.
        if (i.tipo === 'sin_cobertura_departamental' || (i.tipo === 'control_no_calculable' && i.detalle.startsWith('Cobertura'))) continue;
        const ref = i.unidades[0];
        expect(ref && capa.features[ref.indice]?.properties.name).toBe(ref?.nombre);
      }
    }
  });
  it('rechaza informes de otra edición antes de escribir', () => {
    const r = temporal();
    mkdirSync(join(r, 'packages/shared/src/datos'), { recursive: true });
    writeFileSync(join(r, 'packages/shared/src/datos/geografia.generated.json'), JSON.stringify({ version: 'otra' }));
    expect(() => publicarAuditoria(r, texto)).toThrow('edición activa');
  });
  it('un polígono inválido bloquea la activación y conserva la edición previa', () => {
    const r = temporal();
    const entrada = join(raiz, `apps/web/public/geo/versiones/${GEOGRAFIA.version}`);
    publicarGeografia(r, entrada, '2026-09-22');
    const activo = join(r, 'packages/shared/src/datos/geografia.generated.json');
    const anterior = readFileSync(activo, 'utf8');
    vi.mocked(comprobarPoligonos).mockImplementation(() => { throw new Error('Polígono inválido'); });
    expect(() => publicarGeografia(r, entrada, '2026-10-15')).toThrow('Polígono inválido');
    expect(readFileSync(activo, 'utf8')).toBe(anterior);
  });
});
