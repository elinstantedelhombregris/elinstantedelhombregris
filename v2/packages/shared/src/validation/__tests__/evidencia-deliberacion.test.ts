import { describe, expect, it } from 'vitest';

import {
  argumentoFichaSchema,
  procesoFichaSchema,
  relacionEntreFichasSchema,
} from '../deliberacion-ficha';
import { fuenteFichaSchema, objetivoFichaSchema, cuadernoFichaSchema } from '../evidencia-ficha';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const fuente = {
  id: A,
  titulo: 'Tiempo de espera',
  institucion: 'Equipo de relevamiento',
  url: 'https://example.org/datos',
  referencia: '2026-10-01',
  obtenida: '2026-10-02',
  unidad: 'minutos',
  universo: 'Consultas del período relevado',
  territorioId: null,
  metodo: 'Registro de horarios sin datos personales',
  licencia: 'CC BY 4.0',
  frecuencia: 'Mensual',
  limites: 'Una semana de observación no describe todo el año',
  estado: 'disponible',
  valor: 0,
};
const objetivo = {
  id: B,
  titulo: 'Menos espera',
  resultado: 'Acceder sin perder la jornada',
  horizonte: '2027-03-01',
  territorios: [],
  ambito: 'Personas que requieren turnos',
  indicador: 'Mediana de espera',
  unidad: 'minutos',
  lineaBase: null,
  fechaBase: null,
  meta: null,
  tareaPendiente: 'Registrar tiempos durante una semana acordada',
  fuenteIds: [],
  metodo: 'Comparar el mismo horario y alcance',
  escala: 'comunitaria',
  institucionPropuesta: '',
  competencia: 'por_validar',
  fuenteCompetencia: null,
  principios: '',
  gravedad: '',
  desigualdad: '',
  viabilidad: '',
};

describe('Evidencia y objetivos verificables', () => {
  it('distingue cero, ausencia y dato no publicado', () => {
    expect(fuenteFichaSchema.parse(fuente).valor).toBe(0);
    expect(fuenteFichaSchema.safeParse({ ...fuente, valor: null }).success).toBe(false);
    for (const estado of ['no_publicado', 'no_disponible']) {
      expect(fuenteFichaSchema.safeParse({ ...fuente, estado, valor: null }).success).toBe(true);
      expect(fuenteFichaSchema.safeParse({ ...fuente, estado, valor: 0 }).success).toBe(false);
    }
  });
  it('conserva el valor y sus fechas cuando falla una actualización', () => {
    const f = fuenteFichaSchema.parse({
      ...fuente,
      actualizacion: {
        estado: 'fallida',
        fecha: '2026-10-14',
        detalle: 'La publicación mensual todavía no está accesible.',
      },
    });
    expect(f).toMatchObject({
      valor: 0,
      referencia: '2026-10-01',
      actualizacion: { estado: 'fallida' },
    });
  });
  it('rechaza enlaces ejecutables y números no finitos', () => {
    expect(fuenteFichaSchema.safeParse({ ...fuente, url: 'javascript:alert(1)' }).success).toBe(
      false,
    );
    expect(fuenteFichaSchema.safeParse({ ...fuente, valor: Infinity }).success).toBe(false);
  });
  it('exige investigar lo desconocido y documentar una base conocida incluso si es cero', () => {
    expect(objetivoFichaSchema.safeParse(objetivo).success).toBe(true);
    expect(objetivoFichaSchema.safeParse({ ...objetivo, tareaPendiente: '' }).success).toBe(false);
    expect(objetivoFichaSchema.safeParse({ ...objetivo, lineaBase: 0 }).success).toBe(false);
    expect(
      objetivoFichaSchema.safeParse({
        ...objetivo,
        lineaBase: 0,
        fechaBase: '2026-10-01',
        fuenteIds: [A],
      }).success,
    ).toBe(true);
  });
  it('impide publicar fuentes ausentes o duplicadas y competencias sin documento', () => {
    expect(
      cuadernoFichaSchema.safeParse({ fuentes: [], objetivos: [{ ...objetivo, fuenteIds: [A] }] })
        .success,
    ).toBe(false);
    expect(
      cuadernoFichaSchema.safeParse({ fuentes: [fuente, fuente], objetivos: [] }).success,
    ).toBe(false);
    expect(objetivoFichaSchema.safeParse({ ...objetivo, competencia: 'documentada' }).success).toBe(
      false,
    );
    expect(
      cuadernoFichaSchema.safeParse({
        fuentes: [fuente],
        objetivos: [
          {
            ...objetivo,
            institucionPropuesta: 'Municipio',
            competencia: 'documentada',
            fuenteCompetencia: A,
          },
        ],
      }).success,
    ).toBe(true);
  });
});
describe('Deliberación trazable', () => {
  it('exige referencia en respuestas y fuente en hipótesis causales', () => {
    const argumento = {
      idLocal: A,
      tipo: 'respuesta',
      texto: 'Conservar el canal presencial evita excluir a quienes no usan internet.',
      firma: 'Participante',
      respondeA: null,
      alternativaId: null,
      fuenteIds: [],
    };
    expect(argumentoFichaSchema.safeParse(argumento).success).toBe(false);
    expect(argumentoFichaSchema.safeParse({ ...argumento, respondeA: B }).success).toBe(true);
    const relacion = {
      idLocal: A,
      destinoId: B,
      tipo: 'hipotesis_causal',
      justificacion: 'La frecuencia del transporte podría modificar el acceso a turnos.',
      fuente: null,
    };
    expect(relacionEntreFichasSchema.safeParse(relacion).success).toBe(false);
    expect(
      relacionEntreFichasSchema.safeParse({ ...relacion, fuente: 'https://example.org/estudio' })
        .success,
    ).toBe(true);
  });
  it('impide una convocatoria con cierre anterior a la apertura', () => {
    const proceso = {
      pregunta: 'Cómo acceder a turnos cerca de casa',
      ambito: 'Acceso a turnos en esta zona',
      convocatoria: 'Convocatoria abierta presencial y digital',
      facilitacion: 'Equipo de prueba',
      inicio: '2026-10-10',
      cierre: '2026-10-09',
      reglas: 'Escuchar sin publicar datos personales',
      metodoCierre: 'Síntesis abierta a revisión de participantes',
      moderacion: 'Retiro con motivo de información sensible',
      apelacion: 'Pedir revisión al equipo facilitador',
    };
    expect(procesoFichaSchema.safeParse(proceso).success).toBe(false);
    expect(procesoFichaSchema.safeParse({ ...proceso, cierre: proceso.inicio }).success).toBe(true);
  });
});
