import type { CapacidadPublica, ReservaCapacidad } from '@v2/shared';

export const ID = '11111111-1111-4111-8111-111111111111';
export const FICHA = '22222222-2222-4222-8222-222222222222';
export const capacidad: CapacidadPublica = {
  id: ID,
  senalId: ID,
  titulo: 'Sala para apoyo escolar',
  tipo: 'espacio',
  unidad: 'horas',
  cantidad: 10,
  disponible: 0,
  reservada: 10,
  entregada: 0,
  desde: '2026-01-01',
  hasta: '2099-12-31',
  territorioId: null,
  zona: 'Zona del espacio comunitario',
  restricciones: 'Por la tarde, acceso sin escalones',
  firma: 'Equipo de ejemplo',
  confirmadaEn: '2026-10-14T12:00:00Z',
  cerrada: false,
  vigente: true,
  esMia: false,
};
export const reserva: ReservaCapacidad = {
  id: FICHA,
  fichaId: FICHA,
  cantidad: 10,
  paraFecha: '2099-01-01',
  necesidad: 'Apoyo escolar',
  compatibilidad: 'Podemos asistir por la tarde',
  estado: 'entrega_declarada',
  notaEntrega: 'Se facilitaron las horas',
  discrepancia: null,
  creadaEn: '2026-10-14T12:00:00Z',
  actualizadaEn: '2026-10-14T12:00:00Z',
  soySolicitante: true,
};
