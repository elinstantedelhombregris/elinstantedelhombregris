import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import {
  correr,
  ordenCanonico,
  serializarCorrida,
  territoriosConMandatoDe,
} from '../simulacion/espina/corrida.js';
import { leerDiseno, serializarDiseno } from '../simulacion/espina/diseno-serie.js';
import { armarPais, escenarioBase, MOTOR } from '../simulacion/espina/escenario.js';
import { conVariable } from '../simulacion/espina/variables.js';
import { modoForma } from '../simulacion/modo-forma.js';
import { huellaDePoblacion } from '../simulacion/poblacion.js';

import type { Diseno } from '../simulacion/espina/barrer.js';
import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { Persona } from '../simulacion/poblacion.js';
import type { EstadoMedido, Territorio } from '../simulacion/tipos.js';

/**
 * La serialización de una corrida — spec §3.6 y la D5 de la ADR 0009.
 *
 * Lo mínimo para que otra persona la vuelva a correr y obtenga exactamente lo
 * mismo: **semilla, variables, versión del motor y huella de la población**. Y
 * si no obtiene lo mismo, lo mínimo para poder decir cuál de los cuatro cambió,
 * en vez de discutirlo.
 */

const AHORA = 1_800_000_000_000;

const TERRITORIOS: Territorio[] = [
  { id: 'buenos aires', nombre: 'Buenos Aires', poblacion: 17_500_000, km2: 307_571 },
  { id: 'chaco', nombre: 'Chaco', poblacion: 1_140_000, km2: 99_633 },
  { id: 'formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_066 },
];

const BASE: EstadoMedido = { voces: [], ahora: AHORA };
const PAIS: Pais = armarPais(BASE, TERRITORIOS, 'provincia');
const ESC: Escenario = escenarioBase(
  PAIS,
  'el-que-sostiene',
  'El que sostiene',
  '¿Qué pasa si la voz se sostiene en vez de estallar?',
  424242,
  COEFICIENTES,
);

const DISENO: Diseno = {
  base: ESC,
  modo: 'forma',
  claves: ['participacion', 'constancia'],
  objetivo: 'legitimidad',
  metodo: { tipo: 'hipercubo', muestras: 500 },
};

describe('serializar una corrida', () => {
  it('lleva la semilla, las variables, el motor y la huella del país', () => {
    const esc = conVariable(ESC, 'participacion', 700);
    const { corrida } = correr(esc, PAIS, modoForma);
    const serie = serializarCorrida(corrida, esc, ordenCanonico(PAIS));

    expect(serie.semilla).toBe(424242);
    expect(serie.motor).toBe(MOTOR);
    expect(serie.paisHuella).toBe(PAIS.huella);
    expect(serie.variables.participacion).toBe(700);
    expect(serie.variables['composicion.hecho']).toBeCloseTo(0.25, 12);
    expect(serie.variables.PISO_MANDATO).toBe(100);
    // En modo forma no hay población y NO se inventa una huella.
    expect(serie.poblacionHuella).toBeNull();
    expect(serie.sello).toBeNull();
    expect(serie.reproducible).toBe(true);
  });

  it('es JSON puro: sobrevive un viaje de ida y vuelta sin perder nada', () => {
    const esc = conVariable(ESC, 'participacion', 700);
    const { corrida } = correr(esc, PAIS, modoForma);
    const serie = serializarCorrida(corrida, esc, ordenCanonico(PAIS));
    expect(JSON.parse(JSON.stringify(serie))).toEqual(serie);
  });

  it('el bitset viaja como texto legible, alineado con el orden canónico', () => {
    const orden = ordenCanonico(PAIS);
    const esc = conVariable(ESC, 'participacion', 900);
    const { corrida } = correr(esc, PAIS, modoForma);
    const serie = serializarCorrida(corrida, esc, orden);

    expect(serie.mandatos).toHaveLength(orden.length);
    expect(serie.orden).toEqual(orden);
    // Un diff entre dos corridas muestra QUÉ provincia cambió, en vez de dos
    // blobs distintos.
    const conMandato = territoriosConMandatoDe(corrida, orden);
    for (let i = 0; i < orden.length; i++) {
      const id = orden[i] ?? '';
      expect(serie.mandatos[i] === '1').toBe(conMandato.includes(id));
    }
  });

  it('las magnitudes del resumen conservan su procedencia', () => {
    const esc = conVariable(ESC, 'participacion', 700);
    const { corrida } = correr(esc, PAIS, modoForma);
    const serie = serializarCorrida(corrida, esc, ordenCanonico(PAIS));
    expect(serie.resumen.legitimidad?.procedencia).toEqual({
      tipo: 'derivado',
      formula: 'alcance × persistencia',
      de: ['alcance', 'persistencia'],
    });
  });

  it('dos corridas de la misma serialización dan lo mismo', () => {
    const esc = conVariable(ESC, 'participacion', 333);
    const orden = ordenCanonico(PAIS);
    const uno = serializarCorrida(correr(esc, PAIS, modoForma).corrida, esc, orden);
    const otro = serializarCorrida(correr(esc, PAIS, modoForma).corrida, esc, orden);
    expect(uno).toEqual(otro);
  });
});

describe('la huella de la población', () => {
  const persona = (id: number, propension: number): Persona => ({
    id,
    origen: { documento: 'PLANRUTA', ancla: '§2', sha: 'abc' },
    territorio: {
      territorioId: 'chaco',
      provinciaId: 22,
      departamentoId: null,
      localidadId: null,
      celdaId: 'c1',
    },
    conducta: {
      propension,
      constanciaPersonal: 0.5,
      umbralAdhesion: 0.4,
      umbralCorroboracion: 0.6,
      radioAtencion: 'barrio',
      mezclaTipos: {
        basta: 1,
        necesidad: 0,
        recurso: 0,
        práctica: 0,
        saber: 0,
        sueño: 0,
        propuesta: 0,
        compromiso: 0,
        pregunta: 0,
      },
      vinculos: [2, 3],
    },
    semblanza: {
      texto: 'Una vecina que arregla lo que puede.',
      oficio: 'enfermera',
      tramoEdad: '40-50',
      arraigoAnios: 12,
      frases: [],
    },
  });

  it('cambia si cambia la conducta', () => {
    expect(huellaDePoblacion([persona(1, 0.3)])).not.toBe(huellaDePoblacion([persona(1, 0.4)]));
  });

  it('NO cambia si sólo cambia el texto de la semblanza', () => {
    // Deliberado: la dinámica no lee el texto, así que dos elencos con la misma
    // conducta SON el mismo elenco para un barrido. Si el texto entrara en la
    // huella, corregir una tilde invalidaría mil corridas sin cambiar un número.
    const original = persona(1, 0.3);
    const corregida: Persona = {
      ...original,
      semblanza: { ...original.semblanza, texto: 'Una vecina que arregla lo que puede. (corregido)' },
    };
    expect(huellaDePoblacion([corregida])).toBe(huellaDePoblacion([original]));
  });

  it('no depende del orden en que vengan las personas', () => {
    const a = persona(1, 0.3);
    const b = persona(2, 0.7);
    expect(huellaDePoblacion([a, b])).toBe(huellaDePoblacion([b, a]));
  });
});

describe('el diseño, ida y vuelta', () => {
  it('lo que se escribe se vuelve a leer', () => {
    const leido = leerDiseno(JSON.parse(JSON.stringify(serializarDiseno(DISENO))), DISENO);
    expect(leido.avisos).toEqual([]);
    expect(leido.diseno.base.semilla).toBe(DISENO.base.semilla);
    expect(leido.diseno.base.forma.participacion).toBe(DISENO.base.forma.participacion);
    expect(leido.diseno.claves).toEqual(DISENO.claves);
    expect(leido.diseno.metodo).toEqual(DISENO.metodo);
    expect(leido.diseno.objetivo).toBe('legitimidad');
  });

  it('ante basura abre el diseño por defecto en vez de romperse', () => {
    // La disciplina de `area-url.ts`: un link roto no puede dejar a alguien
    // mirando una pantalla en blanco.
    for (const basura of [null, 42, 'no soy un diseño', [], { variables: 'ninguna' }]) {
      const leido = leerDiseno(basura, DISENO);
      expect(leido.diseno.base.forma.participacion).toBe(DISENO.base.forma.participacion);
    }
  });

  it('acota lo que viene fuera de dominio, y lo dice', () => {
    const roto = { ...serializarDiseno(DISENO), variables: { participacion: 1e12 } };
    const leido = leerDiseno(roto, DISENO);
    expect(leido.diseno.base.forma.participacion).toBe(1000);
    expect(leido.avisos.join(' ')).toMatch(/participacion.*se acotó/i);
  });

  it('avisa cuando el diseño viene de otro motor', () => {
    const viejo = { ...serializarDiseno(DISENO), motor: 'civic-core/simulacion@1999-01-01' };
    expect(leerDiseno(viejo, DISENO).avisos.join(' ')).toMatch(/motor/i);
  });

  it('avisa cuando el diseño se armó contra otro país', () => {
    const otro = { ...serializarDiseno(DISENO), paisHuella: '00000000' };
    expect(leerDiseno(otro, DISENO).avisos.join(' ')).toMatch(/otro país/i);
  });

  it('ignora una variable que no existe, y lo dice', () => {
    const conFantasma = { ...serializarDiseno(DISENO), claves: ['participacion', 'karma'] };
    const leido = leerDiseno(conFantasma, DISENO);
    expect(leido.diseno.claves).toEqual(['participacion']);
    expect(leido.avisos.join(' ')).toMatch(/karma/);
  });
});
