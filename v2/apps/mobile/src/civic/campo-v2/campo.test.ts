import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { CuadernoNativo, TareaCampoNativa } from '@v2/shared';
import { nuevoCuaderno, autorizar, revisarConflicto } from './modelo';
import { guardarCuaderno, leerCuadernos, borrarCuaderno } from './archivo';
import { sincronizarCuadernos } from './sincronizar';
import { ErrorCampo } from './conexion';
const m = vi.hoisted(() => ({ db: null as DatabaseSync | null, pedir: vi.fn() }));
vi.mock('@/db/client', () => ({
  expoDb: {
    getAllSync: (s: string, ...p: (string | number)[]) => m.db!.prepare(s).all(...p),
    runSync: (s: string, ...p: (string | number)[]) => m.db!.prepare(s).run(...p),
  },
}));
vi.mock('./conexion', () => ({
  pedirCampo: (...args: unknown[]) => m.pedir(...args),
  ErrorCampo: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));
const conexion = {
  token: 'a'.repeat(64),
  usuarioId: 7,
  dispositivoId: randomUUID(),
  origen: 'https://v2.test',
};
const tarea: TareaCampoNativa = {
  id: 31,
  iniciativaId: 10,
  slug: 'escuela',
  titulo: 'Escuchar horarios',
  alcance: 'Conversar en distintos horarios',
  revision: 2,
  estado: 'in_progress',
  fichaId: randomUUID(),
  fichaTitulo: 'Llegar a la escuela',
  escucha: {
    territorioId: null,
    zona: 'Entorno de escuela',
    metodo: 'conversacion',
    canal: 'presencial',
    convocatoria: 'Invitar sin registrar datos personales.',
    unidad: 'Encuentros de barrio',
    versionUnidad: '1',
  },
};
function borrador(): CuadernoNativo {
  const c = nuevoCuaderno(randomUUID(), 7, conexion.origen, tarea);
  return {
    ...c,
    notas: 'NOTAS PRIVADAS',
    campos: {
      titulo: 'Dos horarios',
      texto: 'Dos encuentros muestran dificultades en el ingreso escolar.',
      desde: '2026-10-01',
      hasta: '2026-10-02',
      observaciones: '2',
      ausencias: 'Faltan otros horarios.',
      limites: 'No describe a todas las familias.',
      proximoPaso: 'Invitar a conversar de noche.',
    },
  };
}
beforeEach(() => {
  m.db = new DatabaseSync(':memory:');
  m.db.exec(
    readFileSync(
      new URL('../../../drizzle/0020_cuadernos_campo_v2.sql', import.meta.url),
      'utf8',
    ).replaceAll('--> statement-breakpoint', ''),
  );
  m.pedir.mockReset();
});
afterEach(() => {
  m.db?.close();
});
describe('Cuaderno nativo persistente', () => {
  it('separa cuenta y origen, compara versiones y no incluye notas al autorizar', () => {
    const c = guardarCuaderno(borrador());
    expect(leerCuadernos(8, conexion.origen)).toHaveLength(0);
    expect(leerCuadernos(7, 'https://otra.test')).toHaveLength(0);
    guardarCuaderno({ ...c, notas: 'otra nota' });
    expect(() => guardarCuaderno(c)).toThrow('cambió');
    const e = autorizar(c, randomUUID());
    expect(JSON.stringify(e.sobre)).not.toContain('PRIVADAS');
    expect(e.sobre?.resultadoEscucha.observaciones).toBe(2);
    expect(() =>
      autorizar({ ...c, campos: { ...c.campos, observaciones: '' } }, randomUUID()),
    ).toThrow();
    expect(() => borrarCuaderno({ ...c, estado: 'pendiente' })).toThrow('pendiente');
  });
  it('conserva cuerpo e identidad luego de respuesta perdida y pausa después de cinco intentos', async () => {
    const c = guardarCuaderno(autorizar(borrador(), randomUUID()));
    m.pedir.mockRejectedValueOnce(new Error('Respuesta perdida'));
    await sincronizarCuadernos(conexion, true);
    const perdido = leerCuadernos(7, conexion.origen)[0]!;
    expect(perdido.estado).toBe('pendiente');
    expect(perdido.sobre).toEqual(c.sobre);
    m.pedir.mockResolvedValue({ id: 88 });
    await sincronizarCuadernos(conexion, true);
    expect(m.pedir.mock.calls[0]?.[2]).toEqual(m.pedir.mock.calls[1]?.[2]);
    expect(leerCuadernos(7, conexion.origen)[0]).toMatchObject({
      estado: 'enviado',
      evidenciaId: 88,
    });
    guardarCuaderno({ ...borrador(), estado: 'pendiente', sobre: c.sobre, intentos: 5 });
    m.pedir.mockClear();
    await sincronizarCuadernos(conexion);
    expect(m.pedir).not.toHaveBeenCalled();
  });
  it('conserva conflictos y exige revisar antes de generar otra autorización', async () => {
    guardarCuaderno(autorizar(borrador(), randomUUID()));
    m.pedir.mockRejectedValue(new ErrorCampo(409, 'Cambió el destino'));
    await sincronizarCuadernos(conexion, true);
    const c = leerCuadernos(7, conexion.origen)[0]!;
    expect(c.estado).toBe('conflicto');
    const r = revisarConflicto(c, { ...tarea, revision: 3, fichaId: null });
    expect(r).toMatchObject({ estado: 'borrador', notas: c.notas, sobre: null });
    expect(autorizar(r, randomUUID()).sobre?.idLocal).not.toBe(c.sobre?.idLocal);
  });
  it('el retiro tiene recibo propio y no reenvía el texto original', async () => {
    const c = guardarCuaderno({
      ...autorizar(borrador(), randomUUID()),
      evidenciaId: 88,
      retiro: {
        idLocal: randomUUID(),
        revision: 2,
        accion: 'retirar',
        firma: '',
        nota: 'Retiro el resumen publicado.',
      },
    });
    m.pedir.mockResolvedValue({ id: 88 });
    await sincronizarCuadernos(conexion, true);
    expect(m.pedir.mock.calls[0]?.[2]).toEqual(c.retiro);
    expect(leerCuadernos(7, conexion.origen)[0]?.estado).toBe('retirado');
  });
});
