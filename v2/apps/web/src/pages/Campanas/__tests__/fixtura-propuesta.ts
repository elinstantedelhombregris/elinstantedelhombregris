import type { CampanaPublica, ContratoCampana } from '@v2/shared';

/** Unas reglas de campaña que pasan `contratoCampanaSchema`, con fechas lejanas. */
export const contratoValido: ContratoCampana = {
  titulo: 'Plazas con sombra en Salta',
  pregunta: '¿Qué tendría que pasar para que tu plaza tenga sombra todo el año?',
  proposito: 'Juntar lo que imagina el barrio para pedir árboles y bancos donde hacen falta.',
  territorios: [],
  temas: ['ambiente'],
  participantes: 'Vecinas y vecinos de las plazas de la ciudad.',
  canales: ['web'],
  responsable: 'Vecinos por la Sombra',
  devolucion: 'Una lectura pública con lo que pidió cada plaza.',
  fechaDevolucion: '2099-12-20',
  efecto: 'Un pedido concreto a la municipalidad, firmado por quienes participaron.',
  usoDatos: 'Se publican sólo los textos que sus autores autorizaron.',
  metodoLectura: 'Se agrupan los pedidos por plaza y se contrastan las diferencias.',
  institucion: '',
  fases: [{ nombre: 'Imaginar', salida: 'Aportes de cada plaza.', fecha: '2099-12-01' }],
};

export function campanaPropuesta(cambios: Partial<CampanaPublica> = {}): CampanaPublica {
  return {
    id: '5b0c1e7a-3f6d-4c2b-9a8e-1d2c3b4a5f60',
    slug: 'plazas-con-sombra',
    revision: 3,
    estado: 'reuniendo',
    creadaEn: '2026-10-20T00:00:00.000Z',
    actualizadaEn: '2026-10-20T00:00:00.000Z',
    puedoEditar: false,
    puedoInvitar: false,
    puedoEditarContrato: false,
    aportes: 0,
    devoluciones: [],
    historial: [],
    contrato: contratoValido,
    impulso: { personas: 18, umbral: 50 },
    impulsadaPorMi: false,
    ...cambios,
  };
}
