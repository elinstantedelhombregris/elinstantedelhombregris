import { describe, expect, it, vi } from 'vitest';

import { instantes } from './instantes';
import { CLAVE_ROTACION, crearRotacion } from './rotacion-instantes';

const ids = instantes.map((entry) => entry.id);

function almacenEnMemoria() {
  const valores = new Map<string, string>();
  return {
    getItem: (clave: string) => valores.get(clave) ?? null,
    setItem: (clave: string, valor: string) => {
      valores.set(clave, valor);
    },
  };
}

function opciones(almacen = almacenEnMemoria()) {
  return {
    almacen: () => almacen,
    azar: () => 0.314159,
    exclusivo: (accion: () => string) => Promise.resolve(accion()),
  };
}

describe('la rotación persistente de los 50 instantes', () => {
  it('agota las 50 citas entre cargas y mezcla otro ciclo sin repetir la última', async () => {
    const compartidas = opciones();
    const vistas: string[] = [];
    for (let carga = 0; carga < 150; carga++) {
      vistas.push(await crearRotacion(ids, compartidas).inicial());
    }
    for (let inicio = 0; inicio < vistas.length; inicio += 50) {
      expect(new Set(vistas.slice(inicio, inicio + 50))).toEqual(new Set(ids));
      if (inicio > 0) expect(vistas[inicio]).not.toBe(vistas[inicio - 1]);
    }
  });

  it('consume una sola cita aunque React solicite la entrada varias veces', async () => {
    const compartidas = opciones();
    const pagina = crearRotacion(ids, compartidas);
    const entradas = await Promise.all(Array.from({ length: 20 }, () => pagina.inicial()));
    expect(new Set(entradas).size).toBe(1);
    const ciclo = [entradas[0]];
    for (let carga = 1; carga < 50; carga++) {
      ciclo.push(await crearRotacion(ids, compartidas).inicial());
    }
    expect(new Set(ciclo)).toEqual(new Set(ids));
  });

  it('comparte el ciclo entre Otro instante y las siguientes visitas', async () => {
    const compartidas = opciones();
    const pagina = crearRotacion(ids, compartidas);
    const vistas = [await pagina.inicial()];
    for (let click = 0; click < 24; click++) vistas.push(await pagina.siguiente());
    for (let carga = 0; carga < 25; carga++) {
      vistas.push(await crearRotacion(ids, compartidas).inicial());
    }
    expect(new Set(vistas)).toEqual(new Set(ids));
  });

  it('evita repetir en el límite aunque la mezcla coloque la última cita primero', async () => {
    let llamadas = 0;
    const pagina = crearRotacion(ids, {
      ...opciones(),
      azar: () => (llamadas++ === 49 ? 0 : 0.999999),
    });
    const vistas: string[] = [];
    for (let visita = 0; visita < 100; visita++) vistas.push(await pagina.siguiente());
    expect(vistas[49]).toBe(ids[49]);
    expect(vistas[50]).not.toBe(vistas[49]);
    expect(new Set(vistas.slice(50))).toEqual(new Set(ids));
  });

  it.each([
    'JSON roto',
    JSON.stringify({ version: 2, orden: ids, posicion: 1, ultima: ids[0] }),
    JSON.stringify({ version: 1, orden: ids.slice(1), posicion: 1, ultima: ids[1] }),
    JSON.stringify({ version: 1, orden: Array<string>(50).fill('01'), posicion: 1, ultima: '01' }),
    JSON.stringify({ version: 1, orden: [...ids.slice(1), 'ajena'], posicion: 1, ultima: ids[1] }),
    JSON.stringify({ version: 1, orden: ids, posicion: 1.5, ultima: ids[0] }),
    JSON.stringify({ version: 1, orden: ids, posicion: 51, ultima: ids[49] }),
    JSON.stringify({ version: 1, orden: ids, posicion: 1, ultima: ids[1] }),
  ])('repara una historia inválida y conserva el nuevo ciclo: %s', async (guardado) => {
    const almacen = almacenEnMemoria();
    almacen.setItem(CLAVE_ROTACION, guardado);
    const compartidas = opciones(almacen);
    const vistas: string[] = [];
    for (let carga = 0; carga < 50; carga++) {
      vistas.push(await crearRotacion(ids, compartidas).inicial());
    }
    expect(new Set(vistas)).toEqual(new Set(ids));
  });

  it.each(['ausente', 'lectura bloqueada', 'escritura bloqueada'])(
    'mantiene el ciclo en memoria con almacenamiento %s',
    async (fallo) => {
      const almacen = almacenEnMemoria();
      const vistas: string[] = [];
      if (fallo === 'lectura bloqueada') {
        vi.spyOn(almacen, 'getItem').mockImplementation(() => {
          throw new Error('bloqueado');
        });
      }
      if (fallo === 'escritura bloqueada') {
        const previa = crearRotacion(ids, opciones(almacen));
        vistas.push(await previa.inicial());
        vi.spyOn(almacen, 'setItem').mockImplementation(() => {
          throw new Error('sin espacio');
        });
      }
      const pagina = crearRotacion(ids, {
        ...opciones(almacen),
        almacen: () => (fallo === 'ausente' ? undefined : almacen),
      });
      while (vistas.length < 50) vistas.push(await pagina.siguiente());
      expect(new Set(vistas)).toEqual(new Set(ids));
    },
  );

  it('lee y escribe dentro del mismo bloqueo para serializar pestañas simultáneas', async () => {
    let cola = Promise.resolve('');
    const compartidas = {
      ...opciones(),
      exclusivo: (accion: () => string) => {
        cola = cola.then(accion);
        return cola;
      },
    };
    const entradas = await Promise.all(
      Array.from({ length: 50 }, () => crearRotacion(ids, compartidas).inicial()),
    );
    expect(new Set(entradas)).toEqual(new Set(ids));
  });

  it('rechaza colecciones vacías o con identificadores duplicados', () => {
    expect(() => crearRotacion([], opciones())).toThrow(/únicos/);
    expect(() => crearRotacion(['01', '01'], opciones())).toThrow(/únicos/);
  });
});
