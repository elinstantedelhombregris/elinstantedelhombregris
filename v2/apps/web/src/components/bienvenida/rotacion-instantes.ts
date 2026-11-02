import { instantes } from './instantes';

export const CLAVE_ROTACION = 'basta_bienvenida_ciclo_v1';

interface Estado {
  version: 1;
  orden: string[];
  posicion: number;
  ultima: string;
}

type Almacen = Pick<Storage, 'getItem' | 'setItem'>;
interface Opciones {
  almacen: () => Almacen | undefined;
  azar: () => number;
  exclusivo: (accion: () => string) => Promise<string>;
}

/** A persisted shuffle bag. Only one ID is consumed by each allocation. */
export function crearRotacion(ids: readonly string[], opciones: Opciones) {
  if (!ids.length || new Set(ids).size !== ids.length) {
    throw new Error('La rotación necesita identificadores únicos.');
  }
  const permitidos = new Set(ids);
  let memoria: Estado | undefined;
  let sinAlmacen = false;
  let inicial: Promise<string> | undefined;

  function validar(valor: unknown): valor is Estado {
    if (!valor || typeof valor !== 'object') return false;
    const candidato = valor as Record<string, unknown>;
    return (
      candidato.version === 1 &&
      Array.isArray(candidato.orden) &&
      candidato.orden.length === ids.length &&
      new Set(candidato.orden).size === ids.length &&
      candidato.orden.every((id) => typeof id === 'string' && permitidos.has(id)) &&
      typeof candidato.posicion === 'number' &&
      Number.isInteger(candidato.posicion) &&
      candidato.posicion >= 1 &&
      candidato.posicion <= ids.length &&
      candidato.ultima === candidato.orden[candidato.posicion - 1]
    );
  }

  function mezclar(ultima?: string): string[] {
    const orden = [...ids];
    for (let i = orden.length - 1; i > 0; i--) {
      const j = Math.floor(opciones.azar() * (i + 1));
      const a = orden[i],
        b = orden[j];
      if (a !== undefined && b !== undefined) {
        orden[i] = b;
        orden[j] = a;
      }
    }
    // Completing a deck must not immediately repeat its final quote.
    if (orden.length > 1 && orden[0] === ultima) {
      const j = 1 + Math.floor(opciones.azar() * (orden.length - 1));
      const a = orden[0],
        b = orden[j];
      if (a !== undefined && b !== undefined) {
        orden[0] = b;
        orden[j] = a;
      }
    }
    return orden;
  }

  function consumir(): string {
    let estado = memoria;
    let almacen: Almacen | undefined;
    if (!sinAlmacen) {
      try {
        almacen = opciones.almacen();
        const guardado = almacen?.getItem(CLAVE_ROTACION);
        // Invalid JSON is repaired on the next write, rather than disabling persistence.
        let valor: unknown;
        try {
          valor = guardado ? JSON.parse(guardado) : null;
        } catch {
          valor = null;
        }
        if (validar(valor)) estado = valor;
      } catch {
        sinAlmacen = true;
      }
    }
    const orden = estado && estado.posicion < ids.length ? estado.orden : mezclar(estado?.ultima);
    const posicion = estado && estado.posicion < ids.length ? estado.posicion : 0;
    const id = orden[posicion] ?? ids[0];
    if (id === undefined) throw new Error('La colección está vacía.');
    memoria = { version: 1, orden, posicion: posicion + 1, ultima: id };
    if (almacen && !sinAlmacen) {
      try {
        almacen.setItem(CLAVE_ROTACION, JSON.stringify(memoria));
      } catch {
        sinAlmacen = true;
      }
    }
    return id;
  }

  const siguiente = () => opciones.exclusivo(consumir);
  return { siguiente, inicial: () => (inicial ??= siguiente()) };
}

function almacenDelNavegador(): Almacen | undefined {
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return undefined;
    }
  }
}

function gestorDeBloqueos(navegador: Partial<Navigator>) {
  return navegador.locks;
}

async function exclusivo(accion: () => string): Promise<string> {
  const gestor = gestorDeBloqueos(navigator);
  if (gestor) {
    try {
      return await gestor.request(CLAVE_ROTACION, accion);
    } catch {
      /* Browsers that block Web Locks still keep the local cycle. */
    }
  }
  return accion();
}

const rotacion = crearRotacion(
  instantes.map((entry) => entry.id),
  {
    almacen: almacenDelNavegador,
    azar: () => (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) / 0x100000000,
    exclusivo,
  },
);

export const primerInstanteDeLaCarga = () => rotacion.inicial();
export const siguienteInstante = () => rotacion.siguiente();
