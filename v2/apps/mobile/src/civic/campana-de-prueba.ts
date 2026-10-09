/**
 * Una campaña completa para las pruebas de `ideal-*`: cada prueba cambia sólo lo que le importa.
 * Vive aparte porque un archivo `.test.ts` importado desde otro volvería a registrar sus pruebas.
 */
import type { CampanaPublica } from '@v2/shared';

/** Una campaña completa; cada prueba cambia sólo lo que le importa. */
export function campanaDe(
  cambios: Partial<Omit<CampanaPublica, 'contrato'>> & {
    contrato?: Partial<CampanaPublica['contrato']>;
  } = {},
): CampanaPublica {
  const { contrato, ...resto } = cambios;
  return {
    id: '7a1d9b0e-3c1f-4c9e-8d11-5a7f2c4e9b10',
    slug: 'aprender-en-mendoza',
    revision: 2,
    estado: 'abierta',
    contrato: {
      titulo: 'Aprender en Mendoza',
      pregunta: '¿Qué te gustaría poder aprender cerca de tu casa?',
      proposito: 'Escuchar qué hace falta para aprender sin mudarse de lugar.',
      territorios: [],
      temas: ['educación'],
      participantes: 'Cualquier persona que viva en la provincia.',
      canales: ['web'],
      responsable: 'Marta Quiroga',
      devolucion: 'Un informe público con lo que se leyó, sus límites y lo que sigue.',
      fechaDevolucion: '2026-11-05',
      efecto: 'El informe se entrega al equipo de la campaña y queda publicado.',
      usoDatos: 'Los aportes se leen en conjunto y se publican sin datos de contacto.',
      metodoLectura: 'Lectura humana de cada aporte, agrupados por tema y por lugar.',
      institucion: '',
      fases: [
        { nombre: 'Recibir', salida: 'Se reciben aportes hasta el cierre.', fecha: '2026-10-31' },
      ],
      ...contrato,
    },
    creadaEn: '2026-10-01T10:00:00.000Z',
    actualizadaEn: '2026-10-01T10:00:00.000Z',
    puedoEditar: false,
    aportes: 0,
    devoluciones: [],
    historial: [],
    ...resto,
  };
}
