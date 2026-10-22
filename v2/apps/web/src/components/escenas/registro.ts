import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Las escenas 3D que un MDX puede pedir con `<div data-escena="nombre"></div>`.
 *
 * Cada una es un `lazy()` aparte: `three` entra al navegador recién cuando un
 * lector se acerca a una escena, y nunca en el bundle de base (ADR 0011). Este
 * archivo no importa `three`; solo sabe dónde está cada escena.
 */
export const ESCENAS = {
  horas: lazy(() => import('./horas/EscenaHoras')),
  corriente: lazy(() => import('./corriente/EscenaCorriente')),
  velo: lazy(() => import('./velo/EscenaVelo')),
} as const satisfies Record<string, LazyExoticComponent<ComponentType>>;

export type NombreDeEscena = keyof typeof ESCENAS;

export function esNombreDeEscena(nombre: string): nombre is NombreDeEscena {
  return Object.hasOwn(ESCENAS, nombre);
}

/** Los nombres de escena que pide un cuerpo MDX, en orden de aparición. */
export function escenasPedidas(cuerpo: string): string[] {
  return [...cuerpo.matchAll(/data-escena="([^"]*)"/g)].map((m) => m[1] ?? '');
}
