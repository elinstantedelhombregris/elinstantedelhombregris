/**
 * Máquina de estados de misión (Mission Layer del protocolo):
 * PROPUESTA → EQUIPO → ACTIVA → VERIFICACION → RESUELTA, con vuelta
 * VERIFICACION→ACTIVA (obra rechazada) y ABANDONADA desde todo estado
 * no terminal. Al resolverse, la misión se disuelve: nada es permanente.
 */
import type { EstadoMision, Gobernanza, RolMiembro } from './tipos';

const TRANSICIONES: Record<EstadoMision, readonly EstadoMision[]> = {
  propuesta: ['equipo', 'abandonada'],
  equipo: ['activa', 'abandonada'],
  activa: ['verificacion', 'abandonada'],
  verificacion: ['resuelta', 'activa'],
  resuelta: [],
  abandonada: [],
};

export const transicionValida = (
  desde: EstadoMision,
  hacia: EstadoMision,
): boolean => TRANSICIONES[desde].includes(hacia);

/** Regla de resolución según la gobernanza elegida en la fundación. */
export const puedeResolver = (
  gobernanza: Gobernanza,
  actor: RolMiembro,
  aceptaciones: number,
  totalMiembros: number,
): boolean => {
  if (gobernanza === 'coordinada') return actor === 'coordinador';
  return aceptaciones >= Math.ceil(totalMiembros / 2);
};
