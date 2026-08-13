import { describe, expect, it } from 'vitest';

import { TIPOS_SENAL } from '../senal/vocabulario.js';
import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { congelarElenco } from '../simulacion/elenco.js';
import { huellaDeCosecha, totalDeVoces } from '../simulacion/espina/cosecha.js';
import { armarPais, MOTOR } from '../simulacion/espina/escenario.js';
import {
  ACTORES_PARA_CORROBORAR,
  correrFuncion,
  modoGente,
  retratoDeLaFuncion,
} from '../simulacion/modo-gente.js';
import { esHipotesis } from '../simulacion/procedencia.js';

import type { TipoSenal } from '../senal/vocabulario.js';
import type { Elenco } from '../simulacion/elenco.js';
import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { Evento } from '../simulacion/modo-gente.js';
import type { Conducta, Persona } from '../simulacion/poblacion.js';
import type { SelloDelModelo } from '../simulacion/procedencia.js';
import type { Territorio } from '../simulacion/tipos.js';

/**
 * El modo gente — spec §4.2.
 *
 * Las guardas de este archivo no son cobertura de rutina: son la lección de
 * MiroFish escrita como test. Trece de sus dieciséis perillas se generan, se
 * serializan y **no las lee nadie**; quien las mueve ve cambiar el resultado
 * por el ruido del modelo y cree que aprendió algo. Acá cada campo que existe
 * tiene un test que falla si el motor deja de leerlo.
 */

const AHORA = 1_800_000_000_000;

/** Sólo para el `??` de los tests: `no-non-null-assertion` es error en el repo. */
const MECANISMO_VACIO = {
  poblacionHuella: '',
  chispa: 0,
  contagio: 0,
  desaliento: 0,
  grado: 0,
} as const;

const TERRITORIOS: readonly Territorio[] = [
  { id: 'Alfa', nombre: 'Alfa', poblacion: 400_000, km2: 100 },
  { id: 'Beta', nombre: 'Beta', poblacion: 200_000, km2: 100 },
];

const mezclaPareja = (): Record<TipoSenal, number> => {
  const mezcla = {} as Record<TipoSenal, number>;
  for (const tipo of TIPOS_SENAL) mezcla[tipo] = 1;
  return mezcla;
};

const conducta = (over: Partial<Conducta> = {}): Conducta => ({
  propension: 0.5,
  constanciaPersonal: 0.5,
  umbralAdhesion: 0.1,
  umbralCorroboracion: 0.2,
  radioAtencion: 'provincia',
  mezclaTipos: mezclaPareja(),
  vinculos: [],
  ...over,
});

const SELLO: Omit<SelloDelModelo, 'poblacionHuella'> = {
  modelo: 'llama3.1:8b-instruct-q4_K_M',
  digest: 'abc123',
  temperatura: 0,
  semilla: 7,
  generadaEn: AHORA,
};

/** Un elenco chico y determinista, sin modelo de por medio. */
function elencoDePrueba(
  cuantas = 60,
  ajustar: (i: number) => Partial<Conducta> = () => ({}),
  conSello = false,
): Elenco {
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
      conducta: conducta({
        // Vínculos a los vecinos inmediatos, deterministas.
        vinculos: [(i + 1) % cuantas, (i + 2) % cuantas, (i + 3) % cuantas, (i + 4) % cuantas],
        ...ajustar(i),
      }),
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
  return congelarElenco(
    { personas, padre: null, sello: conSello ? SELLO : null, corpus: [] },
    TERRITORIOS,
  );
}

function paisVacio(): Pais {
  return armarPais({ voces: [], ahora: AHORA }, TERRITORIOS, 'provincia');
}

function escenario(elenco: Elenco, over: Partial<Escenario> = {}): Escenario {
  const pais = paisVacio();
  return {
    id: 'prueba',
    nombre: 'Prueba',
    pregunta: '¿Qué pasa si esta gente habla?',
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
    semilla: 7,
    mecanismo: {
      poblacionHuella: elenco.poblacion.huella,
      chispa: 0.3,
      contagio: 0.6,
      desaliento: 0.5,
      grado: 4,
    },
    motor: MOTOR,
    ...over,
  };
}

describe('la función es determinista y tiene varianza', () => {
  it('la misma semilla da la misma cosecha, byte a byte', () => {
    const elenco = elencoDePrueba();
    const pais = paisVacio();
    const esc = escenario(elenco);
    expect(huellaDeCosecha(modoGente(esc, pais, elenco))).toBe(
      huellaDeCosecha(modoGente(esc, pais, elenco)),
    );
  });

  it('dos semillas distintas dan cosechas distintas — hay varianza para un Monte Carlo', () => {
    const elenco = elencoDePrueba();
    const pais = paisVacio();
    const siete = modoGente(escenario(elenco, { semilla: 7 }), pais, elenco);
    const ocho = modoGente(escenario(elenco, { semilla: 8 }), pais, elenco);
    expect(totalDeVoces(siete)).not.toBe(totalDeVoces(ocho));
  });

  it('el azar es por coordenada: agregar una persona no corre el azar de las demás', () => {
    // Con un PRNG secuencial esto fallaría, y ése es el punto: dos corridas con
    // distinto N dejarían de ser comparables y un Monte Carlo mediría su propio
    // reordenamiento. Se comparan las primeras 30 personas del elenco chico
    // contra las mismas 30 del grande, en la ronda 0, sin vínculos ni ambiente
    // para que sólo mande el sorteo de activación.
    const sinVinculos = (): Partial<Conducta> => ({ vinculos: [], radioAtencion: 'cuadra' });
    const chico = elencoDePrueba(30, sinVinculos);
    const grande = elencoDePrueba(60, sinVinculos);
    const pais = paisVacio();

    const primeraRonda = (elenco: Elenco): number => {
      const esc = escenario(elenco, { ajustes: { horizonte: 1 / 12, resistencia: 0, cumplimiento: 0.5 } });
      return correrFuncion(esc, pais, elenco).activasPorRonda[0] ?? -1;
    };
    // Las 30 primeras personas son idénticas en los dos elencos y su sorteo
    // depende de (semilla, ronda, índice): las mismas hablan en los dos.
    expect(primeraRonda(chico)).toBeGreaterThan(0);
    const activasChico = primeraRonda(chico);
    const activasGrande = primeraRonda(grande);
    expect(activasGrande).toBeGreaterThanOrEqual(activasChico);
  });
});

describe('ningún campo de Conducta es utilería', () => {
  const pais = paisVacio();

  /** Mueve un campo solo y devuelve la huella de la cosecha resultante. */
  const huellaCon = (over: Partial<Conducta>): string => {
    const elenco = elencoDePrueba(60, () => over);
    return huellaDeCosecha(modoGente(escenario(elenco), pais, elenco));
  };

  const base = huellaCon({});

  it.each<[string, Partial<Conducta>]>([
    ['propension', { propension: 0.9 }],
    ['constanciaPersonal', { constanciaPersonal: 0 }],
    ['umbralAdhesion', { umbralAdhesion: 0.95 }],
    ['umbralCorroboracion', { umbralCorroboracion: 0.95 }],
    ['radioAtencion', { radioAtencion: 'cuadra' }],
    ['vinculos', { vinculos: [1] }],
  ])('mover %s cambia la cosecha', (_campo, over) => {
    expect(huellaCon(over)).not.toBe(base);
  });

  it('mover mezclaTipos cambia la cosecha', () => {
    const soloBasta = {} as Record<TipoSenal, number>;
    for (const tipo of TIPOS_SENAL) soloBasta[tipo] = tipo === 'basta' ? 1 : 0;
    expect(huellaCon({ mezclaTipos: soloBasta })).not.toBe(base);
  });
});

describe('ninguna palanca del mecanismo es utilería', () => {
  const pais = paisVacio();
  const elenco = elencoDePrueba();
  const base = huellaDeCosecha(modoGente(escenario(elenco), pais, elenco));

  const conMecanismo = (over: Record<string, number>): string => {
    const esc = escenario(elenco);
    const mecanismo = esc.mecanismo ?? MECANISMO_VACIO;
    return huellaDeCosecha(
      modoGente(
        {
          ...esc,
          // El desaliento sólo muerde con resistencia > 0: es su definición.
          ajustes: { ...esc.ajustes, resistencia: 0.8 },
          mecanismo: { ...mecanismo, ...over },
        },
        pais,
        elenco,
      ),
    );
  };

  it('chispa mueve', () => { expect(conMecanismo({ chispa: 0.9 })).not.toBe(base); });
  it('contagio mueve', () => { expect(conMecanismo({ contagio: 0 })).not.toBe(base); });
  it('grado mueve', () => { expect(conMecanismo({ grado: 1 })).not.toBe(base); });
  it('desaliento mueve, y sólo contra resistencia', () => {
    expect(conMecanismo({ desaliento: 0 })).not.toBe(conMecanismo({ desaliento: 1 }));
  });
  it('cumplimiento mueve: es la primera vez que esa palanca hace algo', () => {
    const esc = escenario(elenco);
    const nada = huellaDeCosecha(
      modoGente({ ...esc, ajustes: { ...esc.ajustes, cumplimiento: 0 } }, pais, elenco),
    );
    const todo = huellaDeCosecha(
      modoGente({ ...esc, ajustes: { ...esc.ajustes, cumplimiento: 1 } }, pais, elenco),
    );
    expect(nada).not.toBe(todo);
  });
});

describe('la forma es SALIDA de este modo, no entrada', () => {
  it('mover las cuatro variables de forma no cambia una sola voz', () => {
    const elenco = elencoDePrueba();
    const pais = paisVacio();
    const esc = escenario(elenco);
    const otra = modoGente(
      {
        ...esc,
        forma: {
          participacion: 900,
          dispersion: 1,
          constancia: 1,
          composicion: { hecho: 1, deseo: 0, acto: 0, meta: 0 },
        },
      },
      pais,
      elenco,
    );
    expect(huellaDeCosecha(otra)).toBe(huellaDeCosecha(modoGente(esc, pais, elenco)));
  });
});

describe('el guion se lee', () => {
  it('un evento programado cambia el resultado', () => {
    const elenco = elencoDePrueba();
    const pais = paisVacio();
    const esc = escenario(elenco);
    const sinGuion = correrFuncion(esc, pais, elenco).cosecha;
    const guion: readonly Evento[] = [
      { ronda: 2, que: 'sembrarSenal', territorioId: 'Beta', tipo: 'necesidad', cuantas: 25 },
    ];
    const conGuion = correrFuncion(esc, pais, elenco, { guion }).cosecha;
    expect(totalDeVoces(conGuion)).toBe(totalDeVoces(sinGuion) + 25);
  });

  it('silenciar un territorio lo apaga desde esa ronda', () => {
    const elenco = elencoDePrueba();
    const pais = paisVacio();
    const esc = escenario(elenco);
    const guion: readonly Evento[] = [{ ronda: 0, que: 'silenciar', territorioId: 'Beta' }];
    const cosecha = correrFuncion(esc, pais, elenco, { guion }).cosecha;
    const enBeta = cosecha.celdas.filter((c) => c.territorioId === 'Beta');
    expect(enBeta.reduce((s, c) => s + c.voces, 0)).toBe(0);
  });

  it('el orden del guion es canónico, no el de llegada', () => {
    const elenco = elencoDePrueba();
    const pais = paisVacio();
    const esc = escenario(elenco);
    const a: Evento = { ronda: 1, que: 'sembrarSenal', territorioId: 'Alfa', tipo: 'basta', cuantas: 3 };
    const b: Evento = { ronda: 0, que: 'moverPalanca', campo: 'chispa', valor: 0.8 };
    const uno = correrFuncion(esc, pais, elenco, { guion: [a, b] }).cosecha;
    const otro = correrFuncion(esc, pais, elenco, { guion: [b, a] }).cosecha;
    expect(huellaDeCosecha(uno)).toBe(huellaDeCosecha(otro));
  });
});

describe('el anonimato es una declaración, no un default escondido', () => {
  it('sin declararlo, ninguna señal queda sin actor', () => {
    const elenco = elencoDePrueba();
    const cosecha = correrFuncion(escenario(elenco), paisVacio(), elenco).cosecha;
    expect(cosecha.celdas.reduce((s, c) => s + c.sinActor, 0)).toBe(0);
  });

  it('declarándolo, aparece el residuo que la nitidez necesita poder ver', () => {
    const elenco = elencoDePrueba();
    const cosecha = correrFuncion(escenario(elenco), paisVacio(), elenco, {
      anonimato: 0.4,
    }).cosecha;
    expect(cosecha.celdas.reduce((s, c) => s + c.sinActor, 0)).toBeGreaterThan(0);
  });
});

describe('el rastro y el motor de mandatos', () => {
  it('las adhesiones y confirmaciones son aristas, y las confirmaciones corroboran', () => {
    const elenco = elencoDePrueba(60, () => ({
      umbralAdhesion: 0,
      umbralCorroboracion: 0,
      propension: 0.6,
    }));
    const resultado = correrFuncion(escenario(elenco), paisVacio(), elenco, { rastro: true });
    const rastro = resultado.rastro;
    expect(rastro).not.toBeNull();
    if (rastro === null) return;

    expect(rastro.adhesiones.length).toBeGreaterThan(0);
    expect(rastro.confirmaciones.length).toBeGreaterThan(0);
    // Nadie se confirma a sí mismo, y nadie confirma dos veces la misma señal.
    for (const c of rastro.confirmaciones) {
      expect(rastro.senales[c.senalId]?.actorId).not.toBe(c.personaId);
    }
    const pares = new Set(rastro.confirmaciones.map((c) => `${String(c.senalId)}#${String(c.personaId)}`));
    expect(pares.size).toBe(rastro.confirmaciones.length);

    // Sólo se corrobora lo verificable — regla 11.
    for (const c of rastro.confirmaciones) {
      const senal = rastro.senales[c.senalId];
      expect(senal?.clase === 'hecho' || senal?.clase === 'acto').toBe(true);
    }

    // Con ACTORES_PARA_CORROBORAR distintos, la señal pasa a corroborada.
    const conteo = new Map<number, Set<number>>();
    for (const c of rastro.confirmaciones) {
      const set = conteo.get(c.senalId) ?? new Set<number>();
      set.add(c.personaId);
      conteo.set(c.senalId, set);
    }
    for (const [senalId, actores] of conteo) {
      if (actores.size >= ACTORES_PARA_CORROBORAR) {
        const estado = rastro.senales[senalId]?.estado;
        expect(estado === 'corroborada' || estado === 'resuelta').toBe(true);
      }
    }
  });

  it('las señales llevan los dos relojes, derivados con la función real', () => {
    const elenco = elencoDePrueba();
    const rastro = correrFuncion(escenario(elenco), paisVacio(), elenco, { rastro: true }).rastro;
    expect(rastro).not.toBeNull();
    for (const senal of rastro?.senales ?? []) {
      expect(senal.venceEl).toBeGreaterThan(senal.publicadaEn);
      expect(senal.caducaEl).toBeGreaterThan(senal.venceEl);
      if (senal.clase === 'acto') expect(senal.comprometidoPara).not.toBeNull();
      else expect(senal.comprometidoPara).toBeNull();
    }
  });

  it('el motor de mandatos lee la cosecha igual que si fuera real', () => {
    // Elenco grande y hablador: alcanza el piso de 100 cada 100.000 habitantes.
    const elenco = elencoDePrueba(600, () => ({ propension: 1, constanciaPersonal: 1 }));
    const esc = escenario(elenco);
    const cosecha = modoGente(esc, paisVacio(), elenco);
    const retrato = retratoDeLaFuncion(cosecha, TERRITORIOS, esc, elenco.sello);
    const alfa = retrato.porTerritorio.get('Alfa');
    expect(alfa).toBeDefined();
    expect(alfa?.veredicto.hay).toBe(true);
    expect(alfa?.veredicto.falta).toBe('ninguna');
  });
});

describe('la marca de hipótesis viaja en el dato', () => {
  it('sin modelo, la cosecha es declarada y ninguna magnitud es hipótesis', () => {
    const elenco = elencoDePrueba(200, () => ({ propension: 1 }));
    const esc = escenario(elenco);
    const cosecha = modoGente(esc, paisVacio(), elenco);
    expect(cosecha.autoridad).toBe('declarada');
    const retrato = retratoDeLaFuncion(cosecha, TERRITORIOS, esc, elenco.sello);
    expect(esHipotesis(retrato.alcance.procedencia)).toBe(false);
  });

  it('con modelo, la cosecha es hipótesis y el sello llega hasta la última magnitud', () => {
    const elenco = elencoDePrueba(200, () => ({ propension: 1 }), true);
    const esc = escenario(elenco);
    const resultado = correrFuncion(esc, paisVacio(), elenco, { rastro: true });
    expect(resultado.cosecha.autoridad).toBe('hipotesis');
    expect(resultado.sello?.poblacionHuella).toBe(elenco.poblacion.huella);

    // En el dato: cada voz emitida lleva el sello.
    const primera = resultado.rastro?.senales[0];
    expect(primera).toBeDefined();
    expect(esHipotesis(primera?.voz.procedencia ?? { tipo: 'medido', fuente: '' })).toBe(true);

    // Y en lo agregado: la legitimidad, que es un derivado real, sigue siendo
    // hipótesis porque el conteo del que cuelga lo es. No hay lavado.
    const retrato = retratoDeLaFuncion(resultado.cosecha, TERRITORIOS, esc, elenco.sello);
    expect(esHipotesis(retrato.legitimidad.procedencia)).toBe(true);
  });
});

describe('las guardas que impiden comparar peras con manzanas', () => {
  it('un escenario armado contra otra población no corre', () => {
    const elenco = elencoDePrueba();
    const esc = escenario(elenco);
    const mecanismo = esc.mecanismo ?? MECANISMO_VACIO;
    expect(() =>
      modoGente({ ...esc, mecanismo: { ...mecanismo, poblacionHuella: 'otra' } }, paisVacio(), elenco),
    ).toThrow(/población/i);
  });

  it('un escenario sin mecanismo no corre en modo gente', () => {
    const elenco = elencoDePrueba();
    expect(() => modoGente({ ...escenario(elenco), mecanismo: null }, paisVacio(), elenco)).toThrow(
      /mecanismo/i,
    );
  });

  it('sin elenco no hay modo gente, y no se inventa uno', () => {
    const elenco = elencoDePrueba();
    expect(() => modoGente(escenario(elenco), paisVacio(), null)).toThrow(/elenco/i);
  });

  it('una ronda es un período: las rondas salen del horizonte', () => {
    const elenco = elencoDePrueba();
    const esc = escenario(elenco);
    const resultado = correrFuncion(
      { ...esc, ajustes: { ...esc.ajustes, horizonte: 2 } },
      paisVacio(),
      elenco,
    );
    expect(resultado.rondas).toBe(24);
    expect(resultado.cosecha.periodos).toBe(24);
  });
});
