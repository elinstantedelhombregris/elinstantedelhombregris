import { render, screen } from '@testing-library/react';
import {
  armarPais,
  congelarElenco,
  correr,
  COEFICIENTES,
  escenarioBase,
  modoForma,
  modoGente,
  TIPOS_SENAL,
  type Conducta,
  type Cosecha,
  type Elenco,
  type Escenario,
  type Pais,
  type Persona,
  type SelloDelModelo,
  type Territorio,
} from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { FichaDeCorrida } from '../sections/FichaDeCorrida';

/**
 * Lo que se afirma acá es del §7.1.7 y no de la maquetación: **una magnitud
 * `hipotesis` no comparte tratamiento visual con una `medido` en ningún lado**.
 *
 * `logrado` es el caso que más importa, porque es la columna que la ficha pone
 * bajo «lo que hizo la población» y la que en modo gente sale de una población
 * que escribió un modelo. Salía con la misma tipografía y el mismo color que lo
 * pedido — o sea, presentada como un hecho.
 */

const AHORA = 1_800_000_000_000;

const TERRITORIOS: readonly Territorio[] = [
  { id: 'Alfa', nombre: 'Alfa', poblacion: 400_000, km2: 100 },
  { id: 'Beta', nombre: 'Beta', poblacion: 200_000, km2: 100 },
];

const SELLO: Omit<SelloDelModelo, 'poblacionHuella'> = {
  modelo: 'llama3.1:8b-instruct-q4_K_M',
  digest: 'abc123',
  temperatura: 0,
  semilla: 7,
  generadaEn: AHORA,
};

const pais = (): Pais => armarPais({ voces: [], ahora: AHORA }, TERRITORIOS, 'provincia');

const mezclaPareja = (): Record<string, number> => {
  const mezcla: Record<string, number> = {};
  for (const tipo of TIPOS_SENAL) mezcla[tipo] = 1;
  return mezcla;
};

/** Un elenco chico y determinista. Con sello o sin él, que es lo que se compara. */
function elenco(conSello: boolean): Elenco {
  const personas: Persona[] = [];
  for (let i = 0; i < 40; i += 1) {
    const territorioId = i % 3 === 0 ? 'Beta' : 'Alfa';
    const conducta = {
      propension: 0.5,
      constanciaPersonal: 0.5,
      umbralAdhesion: 0.1,
      umbralCorroboracion: 0.2,
      radioAtencion: 'provincia',
      mezclaTipos: mezclaPareja(),
      vinculos: [(i + 1) % 40, (i + 2) % 40],
    } as unknown as Conducta;
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
      conducta,
      semblanza: {
        texto: `Persona fabricada ${String(i)}.`,
        oficio: 'docente',
        tramoEdad: '35-44',
        arraigoAnios: 10,
        frases: [],
      },
    });
  }
  return congelarElenco(
    { personas, padre: null, sello: conSello ? SELLO : null, corpus: [] },
    TERRITORIOS,
  );
}

function escenarioDe(unPais: Pais, elencoDado: Elenco | null): Escenario {
  const base = escenarioBase(
    unPais,
    'ficha',
    'Ficha',
    '¿Qué sale de esta gente?',
    2026,
    COEFICIENTES,
  );
  return {
    ...base,
    forma: { ...base.forma, participacion: 400 },
    mecanismo:
      elencoDado === null
        ? null
        : {
            poblacionHuella: elencoDado.poblacion.huella,
            chispa: 0.3,
            contagio: 0.6,
            desaliento: 0.5,
            grado: 2,
          },
  };
}

/** Los tres valores de la columna derecha, que es la que puede mentir. */
const columnaLograda = (): HTMLElement[] =>
  ['Participación', 'Dispersión', 'Constancia'].map((rotulo) => {
    const dt = screen.getByText(rotulo);
    const dd = dt.parentElement?.querySelector('dd');
    const valores = dd?.querySelectorAll('span') ?? [];
    const ultimo = valores[valores.length - 1];
    if (!(ultimo instanceof HTMLElement)) throw new Error(`sin valor logrado para ${rotulo}`);
    return ultimo;
  });

describe('FichaDeCorrida · lo logrado no se pinta como lo medido', () => {
  it('en modo gente con sello: rojo sello, punteado, y lo dice con palabras', () => {
    const unPais = pais();
    const conModelo = elenco(true);
    const modo = (e: Escenario, p: Pais): Cosecha => modoGente(e, p, conModelo);
    const { corrida } = correr(
      escenarioDe(unPais, conModelo),
      unPais,
      modo,
      conModelo.poblacion,
      conModelo.sello,
    );

    render(<FichaDeCorrida corrida={corrida} />);

    for (const valor of columnaLograda()) {
      expect(valor.className).toMatch(/text-sello/);
      expect(valor.className).toMatch(/decoration-dashed/);
      expect(valor.getAttribute('title')).toMatch(/Hipótesis/);
    }
    expect(
      screen.getByText(/población generada por un modelo, no medida/i),
    ).toBeDefined();
  });

  it('en modo forma: tinta común, sin marca de hipótesis y sin la nota', () => {
    const unPais = pais();
    const { corrida } = correr(escenarioDe(unPais, null), unPais, modoForma);

    render(<FichaDeCorrida corrida={corrida} />);

    for (const valor of columnaLograda()) {
      expect(valor.className).toMatch(/text-tinta/);
      expect(valor.className).not.toMatch(/text-sello/);
      expect(valor.className).not.toMatch(/decoration-dashed/);
    }
    expect(screen.queryByText(/población generada por un modelo/i)).toBeNull();
  });

  it('un elenco fabricado por una regla NO se pinta como hipótesis: no hubo modelo', () => {
    // La marca sale de la procedencia y no del nombre del modo. Pintar de rojo
    // todo lo que corre en modo gente sería la misma mentira al revés.
    const unPais = pais();
    const sinModelo = elenco(false);
    const modo = (e: Escenario, p: Pais): Cosecha => modoGente(e, p, sinModelo);
    const { corrida } = correr(
      escenarioDe(unPais, sinModelo),
      unPais,
      modo,
      sinModelo.poblacion,
      null,
    );

    render(<FichaDeCorrida corrida={corrida} />);

    expect(corrida.modo).toBe('gente');
    for (const valor of columnaLograda()) expect(valor.className).not.toMatch(/text-sello/);
  });
});
