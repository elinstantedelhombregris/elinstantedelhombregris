import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { LaRadiografiaEjemplo } from '../../LaRadiografiaEjemplo';
import {
  cifrasDeCorroboracion,
  COBERTURA_Y_SESGO,
  ESCENARIO_BRONCA,
  ESCENARIO_DATO,
  ESCENARIO_RECLAMO,
  LOS_TRES_ESCENARIOS,
  PADRON,
  resumenDelCorpus,
  SELLO_DEL_EJEMPLO,
  UMBRAL_DEL_EJEMPLO,
} from '../ejemplos';
import { ARTEFACTO_DE_VECTORES } from '../ejemplos/vectores';
import { cortarEscenario, medirEscenario } from '../ejemplos-vista';
import { LosTresEjemplos } from '../sections/LosTresEjemplos';
import { MandatoDelEjemplo } from '../sections/MandatoDelEjemplo';

/**
 * El laboratorio cuenta lo que dice. La tabla de los tres decía «las 63
 * personas» cuando las personas son 44 (revisión del 9/10): los conteos del
 * corpus estaban escritos a mano en cinco lugares. Ahora salen de
 * `LOS_TRES_ESCENARIOS` y del padrón, y estos tests lo prueban por dos lados:
 * que lo mostrado coincide con lo contado por fuera, y que cambiar el corpus
 * cambia lo mostrado.
 */

afterEach(() => {
  document.title = '¡BASTA!';
});

const envolver = (nodo: React.ReactNode) => {
  const { hook } = memoryLocation({ path: '/la-radiografia/ejemplo' });
  return render(<Router hook={hook}>{nodo}</Router>);
};

/** Lo que hay, contado acá por otro camino (no con la función que se prueba). */
const frases = ESCENARIO_BRONCA.voces.length;
const personas = new Set(PADRON.map((p) => p.actor)).size;

describe('resumenDelCorpus', () => {
  it('cuenta las frases, las personas, los lugares y los meses del corpus', () => {
    const r = resumenDelCorpus(ESCENARIO_BRONCA);
    expect(r.frases).toBe(frases);
    expect(r.personas).toBe(personas);
    expect(r.lugares).toBeGreaterThan(1);
    expect(r.meses).toBeGreaterThan(1);
    // Hay menos personas que frases: es la distinción que la tabla enseña.
    expect(r.personas).toBeLessThan(r.frases);
  });

  it('es el mismo en los tres escenarios: comparten el padrón entero', () => {
    const [primero, ...resto] = LOS_TRES_ESCENARIOS.map((e) => resumenDelCorpus(e));
    expect(resto.length).toBe(LOS_TRES_ESCENARIOS.length - 1);
    for (const otro of resto) expect(otro).toEqual(primero);
  });

  it('las personas de cada escenario son las del padrón, ni una más', () => {
    for (const escenario of LOS_TRES_ESCENARIOS) {
      expect(new Set(escenario.voces.map((v) => v.actorId)).size).toBe(personas);
    }
  });
});

describe('lo que la pantalla muestra sale de esa cuenta', () => {
  it('el sello y las advertencias del ejemplo usan los números contados', () => {
    expect(SELLO_DEL_EJEMPLO.advertencia).toContain(`Las ${String(frases)} frases`);
    expect(SELLO_DEL_EJEMPLO.huella).toBe(
      `ejemplo-${String(LOS_TRES_ESCENARIOS.length)}x${String(frases)}`,
    );
    const sesgo = COBERTURA_Y_SESGO.join(' ');
    expect(sesgo).toContain(`Son ${String(frases)} frases de ${String(personas)} personas`);
  });

  it('el mandato del escenario sin nada que comprobar cuenta sus frases, no un 63 escrito', () => {
    const recortado = { ...ESCENARIO_BRONCA, voces: ESCENARIO_BRONCA.voces.slice(0, 10) };
    const { container } = envolver(<MandatoDelEjemplo escenario={recortado} tema="papel" />);
    expect(container.textContent).toContain('lo que 10 frases de bronca alcanzan a sostener');
    expect(container.textContent).not.toContain(`${String(frases)} frases`);
  });

  it('la tabla de los tres dice las mismas frases y las mismas personas, y nunca «63 personas»', () => {
    const { container } = envolver(<LosTresEjemplos tema="papel" />);
    fireEvent.click(screen.getByText('Comparar los tres escenarios y sus límites'));
    const texto = container.textContent;
    expect(texto).toContain(
      `las mismas ${String(frases)} frases, las mismas ${String(personas)} personas`,
    );
    expect(texto).toContain(`cuánto representan las ${String(personas)} personas`);
    // La contradicción que había: filas llamadas personas.
    expect(texto).not.toContain(`${String(frases)} personas`);
    const fila = screen.getByRole('row', { name: /Personas distintas/ });
    expect(within(fila).getAllByRole('cell')[0]).toHaveTextContent(String(personas));
  });

  it('«De las otras N» sale de las frases: N es una menos', () => {
    envolver(<LosTresEjemplos tema="papel" />);
    fireEvent.click(screen.getByText('Comparar los tres escenarios y sus límites'));
    expect(
      screen.getByText(new RegExp(`De las otras ${String(frases - 1)}, la frase mediana`)),
    ).toBeInTheDocument();
  });
});

describe('la página del laboratorio se explica a la vista', () => {
  it('se titula «Laboratorio: las mismas frases, escritas de tres maneras»', () => {
    envolver(<LaRadiografiaEjemplo />);
    const titulo = screen.getByRole('heading', { level: 1 });
    expect(titulo).toHaveAccessibleName('Laboratorio: las mismas frases, escritas de tres maneras');
    // El «tres» del título es verdad: hay tres escenarios.
    expect(LOS_TRES_ESCENARIOS).toHaveLength(3);
  });

  it('la explicación está visible y cuenta las frases', () => {
    envolver(<LaRadiografiaEjemplo />);
    const explicacion = screen.getByText(
      `Son ${frases.toLocaleString('es-AR')} frases inventadas. Elegí cómo están escritas y mirá cómo se agrupan.`,
      { exact: false },
    );
    expect(explicacion).toBeVisible();
    expect(explicacion.className).not.toMatch(/sr-only|\bhidden\b/);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Elegí cómo están escritas las frases' })
        .className,
    ).not.toMatch(/sr-only/);
  });

  it('no deja comandos de terminal ni voz de desarrollador en pantalla', () => {
    const { container } = envolver(<LaRadiografiaEjemplo />);
    expect(container.textContent).not.toMatch(/pnpm|radiografia:ejemplos|\bartefacto\b/i);
  });
});

describe('la prosa de cada escenario no contradice lo que se mide', () => {
  const corte = (e: (typeof LOS_TRES_ESCENARIOS)[number]) =>
    cortarEscenario(medirEscenario(e, ARTEFACTO_DE_VECTORES), UMBRAL_DEL_EJEMPLO);

  it('ningún escenario escribe a mano el tamaño del corpus', () => {
    for (const e of LOS_TRES_ESCENARIOS) {
      const prosa = [e.resumen, e.loQueSeVe, e.mandato.porQue, e.mandato.texto].join(' ');
      // Ni «63 voces» ni «63 personas»: la cantidad de personas es otra (44).
      expect(prosa, e.id).not.toMatch(/\b63 (voces|personas)\b|sesenta y tres voces/i);
      expect(prosa, e.id).not.toMatch(/núcleo|\bvoces\b|\bseñales\b/i);
    }
    expect(ESCENARIO_BRONCA.resumen).toContain(`${String(frases)} frases de bronca`);
    expect(ESCENARIO_RECLAMO.resumen).toContain(`Las mismas ${String(frases)} frases`);
    expect(ESCENARIO_DATO.resumen).toContain(`Las mismas ${String(frases)} frases`);
  });

  it('la bronca: el grupo mayor y las frases sin grupo que dice la prosa son los medidos', () => {
    const c = corte(ESCENARIO_BRONCA);
    expect(ESCENARIO_BRONCA.loQueSeVe).toContain(`Un grupo de ${String(c.mayor)} frases`);
    expect(c.solas).toHaveLength(19);
    expect(ESCENARIO_BRONCA.loQueSeVe).toContain('diecinueve frases sin grupo');
    // «Casi la mitad del corpus» y «casi el triple que el mayor del reclamo».
    expect(c.mayor / frases).toBeGreaterThan(0.45);
    expect(c.mayor / corte(ESCENARIO_RECLAMO).mayor).toBeGreaterThan(2.5);
  });

  it('el reclamo y el dato: la cantidad de grupos y el mayor que dice la prosa son los medidos', () => {
    const r = corte(ESCENARIO_RECLAMO);
    expect(r.nucleos.length).toBe(8);
    expect(r.mayor).toBe(11);
    expect(ESCENARIO_RECLAMO.loQueSeVe).toContain('ocho grupos, y el mayor tiene once');
    // La bronca ya no es «una estrella de 60»: el grupo mayor es el que se mide.
    expect(ESCENARIO_RECLAMO.loQueSeVe).toContain(
      `de un grupo de ${String(corte(ESCENARIO_BRONCA).mayor)} se pasa`,
    );

    const d = corte(ESCENARIO_DATO);
    expect(d.nucleos.length).toBe(10);
    expect(d.mayor).toBe(5);
    expect(ESCENARIO_DATO.loQueSeVe).toContain('Diez grupos y el mayor tiene cinco');
    const c = cifrasDeCorroboracion(ESCENARIO_DATO);
    expect(ESCENARIO_DATO.loQueSeVe).toContain(
      `${String(c.corroboradas)} de las ${String(c.verificables)} frases verificables`,
    );
  });
});
