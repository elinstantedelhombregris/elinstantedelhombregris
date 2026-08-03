import { Control } from '../Chrome';

import type { Palancas } from '@v2/civic-core';

/**
 * Las palancas de la Simulación — spec §4.
 *
 * Cinco mueven algo hoy. `composicion` y `cumplimiento` todavía no las lee el
 * motor: entran con las campañas (rebanada 3). Se muestran igual, con su razón
 * y sin control, porque un dial que no hace nada es peor que una ausencia
 * explicada — es el mismo criterio con que el nivel «departamento» espera la
 * capa del IGN.
 */

export const PALANCAS_INICIALES: Palancas = {
  /** 200 cada 100.000 es el doble del piso: arranca mostrando un país que sí cambia. */
  participacion: 200,
  dispersion: 0.6,
  composicion: {
    basta: 1 / 6,
    sueño: 1 / 6,
    necesidad: 1 / 6,
    compromiso: 1 / 6,
    recurso: 1 / 6,
    valor: 1 / 6,
  },
  horizonte: 2,
  resistencia: 0.3,
  constancia: 0.7,
  cumplimiento: 0.5,
};

interface Dial {
  campo: 'participacion' | 'dispersion' | 'horizonte' | 'resistencia' | 'constancia';
  etiqueta: string;
  explica: string;
  min: number;
  max: number;
  paso: number;
  formato: (v: number) => string;
}

const DIALES: readonly Dial[] = [
  {
    campo: 'participacion',
    etiqueta: 'Cuánta gente habla',
    explica:
      'Voces cada 100.000 habitantes. Es la única variable que controlás en la vida real: se mueve cargándote vos al mapa.',
    min: 0,
    max: 2000,
    paso: 10,
    formato: (v) => `${v.toLocaleString('es-AR')} cada 100 mil`,
  },
  {
    campo: 'dispersion',
    etiqueta: 'Dónde habla',
    explica:
      'De todo amontonado en un lugar a repartido por el país. No crea voces: reparte las mismas. Amontonar cruza el piso en un lado y deja el resto mudo.',
    min: 0,
    max: 1,
    paso: 0.05,
    formato: (v) => (v < 0.2 ? 'Concentrado' : v > 0.8 ? 'Repartido' : `${Math.round(v * 100)}% repartido`),
  },
  {
    campo: 'constancia',
    etiqueta: 'Constancia',
    explica:
      'De un estallido único a un goteo mes a mes. Es la diferencia entre una marcha y un movimiento: un pico no sostiene ningún mandato.',
    min: 0,
    max: 1,
    paso: 0.05,
    formato: (v) => (v < 0.2 ? 'Estallido' : v > 0.8 ? 'Goteo sostenido' : `${Math.round(v * 100)}% sostenido`),
  },
  {
    campo: 'resistencia',
    etiqueta: 'Resistencia del sistema',
    explica:
      'Cuánto empuja de vuelta. A resistencia máxima el piso se quintuplica: tiene que ser superable y caro, porque si fuera insuperable el simulador enseñaría fatalismo.',
    min: 0,
    max: 1,
    paso: 0.05,
    formato: (v) => (v < 0.2 ? 'Colabora' : v > 0.8 ? 'Bloquea' : `${Math.round(v * 100)}% obstruye`),
  },
  {
    campo: 'horizonte',
    etiqueta: 'En cuánto tiempo',
    explica: 'Los años que corre el ensayo. Es lo que decide cuántos períodos hay para sostener.',
    min: 1,
    max: 10,
    paso: 1,
    formato: (v) => `${v} ${v === 1 ? 'año' : 'años'}`,
  },
];

const PENDIENTES = [
  {
    etiqueta: 'Qué dice',
    razon: 'La mezcla de los seis tipos de voz todavía no cambia el resultado: entra con las campañas.',
  },
  {
    etiqueta: 'Cuánto se cumple',
    razon:
      'De los compromisos cargados, cuántos se cumplen. Su único efecto es convertir reportes en resoluciones, y eso llega con las campañas.',
  },
];

export function PanelPalancas({
  palancas,
  onCambiar,
}: {
  palancas: Palancas;
  onCambiar: (p: Palancas) => void;
}) {
  return (
    <>
      {DIALES.map((d) => (
        <Control key={d.campo} etiqueta={`${d.etiqueta} · ${d.formato(palancas[d.campo])}`}>
          <input
            type="range"
            min={d.min}
            max={d.max}
            step={d.paso}
            value={palancas[d.campo]}
            onChange={(e) => {
              onCambiar({ ...palancas, [d.campo]: Number(e.target.value) });
            }}
            aria-label={d.etiqueta}
            className="accent-violeta-claro w-full"
          />
          <p className="text-oscuro-secundario mt-1 text-[11px] leading-snug">{d.explica}</p>
        </Control>
      ))}

      {PENDIENTES.map((p) => (
        <Control key={p.etiqueta} etiqueta={p.etiqueta}>
          <p className="text-oscuro-tenue text-[11px] leading-snug">{p.razon}</p>
        </Control>
      ))}
    </>
  );
}
