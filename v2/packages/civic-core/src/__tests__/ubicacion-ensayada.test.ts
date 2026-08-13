import { describe, expect, it } from 'vitest';

import { direccionPermitida } from '../direcciones.js';
import { prepareRecordLocation, publishedPrecision } from '../location-policy.js';
import { encuadreDeUbicacion, RESPUESTAS_DE_VIVIENDA } from '../senal/ubicacion.js';
import { TIPOS_SENAL } from '../senal/vocabulario.js';
import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { congelarElenco } from '../simulacion/elenco.js';
import { armarPais } from '../simulacion/espina/escenario.js';
import { correrFuncion } from '../simulacion/modo-gente.js';
import {
  HUECOS_DE_UBICACION_ENSAYADA,
  PRECISION_QUE_CONOCE_EL_GENERADOR,
  ubicacionEnsayada,
} from '../simulacion/ubicacion-ensayada.js';

import type { TipoSenal } from '../senal/vocabulario.js';
import type { Elenco } from '../simulacion/elenco.js';
import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { SenalEnsayada } from '../simulacion/modo-gente.js';
import type { Conducta, Persona } from '../simulacion/poblacion.js';
import type { Territorio } from '../simulacion/tipos.js';

/**
 * La ubicación de una señal ensayada — regla 2 de la Constitución de producto.
 *
 * Las señales ensayadas **no pasaban por ninguna política de ubicación**: nacían
 * con un `territorioId` y un `celdaId` sintético, sin `precision`, sin
 * `locationRole` y sin `sensitivity`. No se veía porque el modo gente todavía no
 * pinta un mapa; el día que lo pinte, una señal ensayada saldría con una
 * precisión que ninguna real puede tener, y alguien sacaría conclusiones de ese
 * mapa sobre qué se ve y qué no.
 *
 * La guarda central no es «tiene los campos»: es que **los campos son los mismos
 * que produciría la política real** con las mismas entradas. Un generador con su
 * propia tabla de protección ensaya un sistema que no existe.
 */

const AHORA = 1_800_000_000_000;

const TERRITORIOS: readonly Territorio[] = [
  { id: 'Alfa', nombre: 'Alfa', poblacion: 400_000, km2: 100 },
  { id: 'Beta', nombre: 'Beta', poblacion: 200_000, km2: 100 },
];

const mezclaPareja = (): Record<TipoSenal, number> => {
  const mezcla = {} as Record<TipoSenal, number>;
  for (const tipo of TIPOS_SENAL) mezcla[tipo] = 1;
  return mezcla;
};

const conducta = (vinculos: readonly number[]): Conducta => ({
  propension: 1,
  constanciaPersonal: 0.5,
  umbralAdhesion: 0.1,
  umbralCorroboracion: 0.2,
  radioAtencion: 'provincia',
  mezclaTipos: mezclaPareja(),
  vinculos,
});

function elencoDePrueba(cuantas = 40): Elenco {
  const personas: Persona[] = [];
  for (let i = 0; i < cuantas; i += 1) {
    const territorioId = i % 3 === 0 ? 'Beta' : 'Alfa';
    personas.push({
      id: i,
      origen: { documento: 'planes/PLANAGUA.mdx', ancla: 'El problema', sha: 'aaaaaaaaaaaa' },
      territorio: {
        territorioId,
        provinciaId: 6,
        departamentoId: null,
        localidadId: null,
        celdaId: `${territorioId}#${String(i % 4)}`,
      },
      conducta: conducta([(i + 1) % cuantas, (i + 2) % cuantas]),
      semblanza: {
        texto: `Persona fabricada ${String(i)}.`,
        oficio: 'docente',
        tramoEdad: '35-44',
        arraigoAnios: 10,
        frases: TIPOS_SENAL.map((tipo) => ({
          tipo,
          clase: tipo === 'compromiso' ? ('acto' as const) : ('hecho' as const),
          texto: `frase ${tipo} de ${String(i)}`,
        })),
      },
    });
  }
  return congelarElenco({ personas, padre: null, sello: null, corpus: [] }, TERRITORIOS);
}

function paisVacio(): Pais {
  return armarPais({ voces: [], ahora: AHORA }, TERRITORIOS, 'provincia');
}

function escenario(elenco: Elenco): Escenario {
  const pais = paisVacio();
  return {
    id: 'prueba',
    nombre: 'Prueba',
    pregunta: '¿Cómo sale al mundo el lugar de lo que esta gente dice?',
    paisHuella: pais.huella,
    eje: { eje: 'ninguno' },
    forma: {
      participacion: 0,
      dispersion: 0,
      constancia: 0,
      composicion: { hecho: 0.25, deseo: 0.25, acto: 0.25, meta: 0.25 },
    },
    ajustes: { horizonte: 1, resistencia: 0, cumplimiento: 0.5 },
    coeficientes: COEFICIENTES,
    semilla: 11,
    mecanismo: {
      poblacionHuella: elenco.poblacion.huella,
      chispa: 0.4,
      contagio: 0.3,
      desaliento: 0,
      grado: 2,
    },
    motor: 'civic-core/simulacion@2026-08-13',
  };
}

const senalesDe = (opciones: Parameters<typeof correrFuncion>[3] = {}): readonly SenalEnsayada[] => {
  const elenco = elencoDePrueba();
  const salida = correrFuncion(escenario(elenco), paisVacio(), elenco, { ...opciones, rastro: true });
  return salida.rastro?.senales ?? [];
};

describe('ubicacionEnsayada', () => {
  it('da exactamente lo que daría la política real con las mismas entradas', () => {
    // El oráculo no es una tabla escrita a mano: son las funciones que corre el
    // servidor. Si alguien le agrega una decisión propia al generador, esto se
    // rompe — que es la única forma de que no se le agregue.
    for (const tipo of TIPOS_SENAL) {
      for (const respuesta of RESPUESTAS_DE_VIVIENDA) {
        const nuestra = ubicacionEnsayada(tipo, respuesta);
        const encuadre = encuadreDeUbicacion(tipo, respuesta);
        const real = prepareRecordLocation({
          point: null,
          requestedPrecision: PRECISION_QUE_CONOCE_EL_GENERADOR,
          role: encuadre.role,
          sensitivity: encuadre.sensitivity,
          audience: 'collective',
          sujeto: encuadre.sujeto,
        });

        expect(nuestra.precision).toBe(real.publishedPrecision);
        expect(nuestra.engrosadaPorque).toBe(real.coarsenedBecause);
        expect(nuestra.overridable).toBe(
          publishedPrecision({
            requested: PRECISION_QUE_CONOCE_EL_GENERADOR,
            role: encuadre.role,
            sensitivity: encuadre.sensitivity,
            audience: 'collective',
            sujeto: encuadre.sujeto,
          }).overridable,
        );
        expect(nuestra.permisoDireccion).toBe(
          direccionPermitida(tipo, encuadre.role, encuadre.sensitivity),
        );
      }
    }
  });

  it('sin respuesta cae del lado seguro, no del permisivo', () => {
    // El caso que decide si esto protege algo. `'no'` es una respuesta; la
    // ausencia de respuesta no puede resolverse como la respuesta más cómoda.
    for (const tipo of TIPOS_SENAL) {
      const sinRespuesta = ubicacionEnsayada(tipo, 'sinRespuesta');
      expect(sinRespuesta.locationRole).toBe('subject');
      expect(sinRespuesta.sensitivity).toBe('high');
      // Sobre la casa de otra persona nadie firmó nada: la propuesta de
      // engrosado deja de ser rechazable.
      expect(sinRespuesta.overridable).toBe(false);
      // Y con `subject` + `high` no sobrevive ninguna parte de una dirección.
      expect(sinRespuesta.permisoDireccion).toBe('ninguna');
    }
  });

  it('nunca publica una dirección donde el CHECK de la base la prohíbe', () => {
    // `sim_senales_sujeto_sensible_sin_direccion_chk`: lo que trata de una
    // persona y puede hacerle daño no lleva dirección. Acá no lleva ninguna
    // nunca, y eso se afirma en vez de suponerse.
    for (const tipo of TIPOS_SENAL) {
      for (const respuesta of RESPUESTAS_DE_VIVIENDA) {
        expect(ubicacionEnsayada(tipo, respuesta).direccionEstado).toBe('sin_direccion');
      }
    }
  });

  it('dice lo que no sabe en vez de inventarlo', () => {
    // Departamento, localidad, punto y calle: el generador no los tiene. La
    // lista es el reemplazo honesto de una coordenada fabricada.
    expect([...ubicacionEnsayada('basta', 'no').faltan].sort()).toEqual([
      'calle',
      'departamento',
      'localidad',
      'punto',
    ]);
    expect(HUECOS_DE_UBICACION_ENSAYADA).toHaveLength(4);
  });
});

describe('toda señal ensayada nace con su ubicación', () => {
  it('ninguna sale sin los tres campos que la ingesta real exige', () => {
    const senales = senalesDe({ vivienda: { propia: 1, ajena: 1, no: 2, sinRespuesta: 0 } });
    expect(senales.length).toBeGreaterThan(0);

    for (const senal of senales) {
      // Los tres de `senales_ensayadas`, que son `NOT NULL` en el esquema.
      expect(senal.ubicacion.precision).toBeTruthy();
      expect(senal.ubicacion.locationRole).toBeTruthy();
      expect(senal.ubicacion.sensitivity).toBeTruthy();
      // Y la derivación es la real, señal por señal.
      expect(senal.ubicacion).toEqual(ubicacionEnsayada(senal.tipo, senal.ubicacion.vivienda));
    }
  });

  it('la corrida que no declara de qué habla su población sale toda protegida', () => {
    // El default no es «publicable»: es `subject` + `high` en todas. Sale raro a
    // propósito — una corrida que no declaró esto tiene que verse distinta de
    // una que declaró que nadie habla de la casa de nadie.
    const senales = senalesDe();
    expect(senales.length).toBeGreaterThan(0);
    expect(senales.every((s) => s.ubicacion.locationRole === 'subject')).toBe(true);
    expect(senales.every((s) => s.ubicacion.sensitivity === 'high')).toBe(true);
    expect(senales.every((s) => s.ubicacion.vivienda === 'sinRespuesta')).toBe(true);
  });

  it('el reparto declarado mueve la protección: no es una columna constante', () => {
    // La regla del módulo: un campo que se llena con una constante es una
    // dimensión que el análisis va a reportar como insensible, y va a tener
    // razón. Declarar «nadie habla de una casa» tiene que dar otro mapa.
    const nadie = senalesDe({ vivienda: { propia: 0, ajena: 0, no: 1, sinRespuesta: 0 } });
    const todos = senalesDe({ vivienda: { propia: 0, ajena: 1, no: 0, sinRespuesta: 0 } });

    expect(nadie.some((s) => s.ubicacion.locationRole !== 'subject')).toBe(true);
    expect(nadie.every((s) => s.ubicacion.sensitivity === 'low')).toBe(true);
    expect(todos.every((s) => s.ubicacion.sensitivity === 'high')).toBe(true);
    // Y las dos corridas emitieron lo mismo: lo único que cambió es la política.
    expect(nadie.map((s) => s.tipo)).toEqual(todos.map((s) => s.tipo));
  });

  it('el cierre de un compromiso hereda el lugar del compromiso que cierra', () => {
    // Dos filas del mismo lugar con distinta protección serían un colador: la
    // más floja de las dos manda.
    const senales = senalesDe({
      vivienda: { propia: 1, ajena: 1, no: 1, sinRespuesta: 1 },
    });
    const cierres = senales.filter((s) => s.texto.startsWith('Cumplido: '));
    expect(cierres.length).toBeGreaterThan(0);

    for (const cierre of cierres) {
      // La misma persona puede emitir el mismo compromiso en varias rondas, así
      // que el original no es único por texto: lo que se afirma es que el cierre
      // salió de alguno de ellos, no de un sorteo nuevo.
      const candidatos = senales.filter(
        (s) => s.texto === cierre.texto.slice('Cumplido: '.length) && s.celdaId === cierre.celdaId,
      );
      expect(candidatos.length).toBeGreaterThan(0);
      expect(candidatos.some((o) => o.ubicacion.vivienda === cierre.ubicacion.vivienda)).toBe(true);
    }
  });
});
