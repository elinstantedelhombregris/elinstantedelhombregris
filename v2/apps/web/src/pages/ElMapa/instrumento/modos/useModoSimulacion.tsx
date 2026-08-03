import { simular } from '@v2/civic-core';
import { useEffect, useMemo, useState } from 'react';

import { Control, Segmentado } from '../Chrome';
import { RAMPAS } from '../paleta';
import { CapaProvincias } from '../simulacion/CapaProvincias';
import { Cifra } from '../simulacion/Cifra';
import { coropleticoDe, coropleticoDiferencia, maximoDe } from '../simulacion/coropletico';
import { Cortina } from '../simulacion/Cortina';
import { estadoMedidoDesde, territoriosDesde } from '../simulacion/datos';
import { PALANCAS_INICIALES } from '../simulacion/palancas';
import { PanelPalancas } from '../simulacion/PanelPalancas';

import type { ContextoModo, ResultadoModo } from './tipos';
import type { Palancas } from '@v2/civic-core';

import { useProvincias } from '~/lib/queries/open-data';

/**
 * Modo Simulación — los dos países, lado a lado.
 *
 * Spec: `docs/specs/2026-08-01-el-mapa-simulacion.md`. Es el único modo que
 * necesita SU PROPIA superficie en vez de capas sobre el mapa compartido: la
 * cortina son dos instancias de mapa y no hay forma de recortar una capa por
 * posición de pantalla.
 */

type Vista = 'cortina' | 'diferencia';

const RAMPA_DIFERENCIA = ['#241F17', '#3B2A66', '#5227CC', '#9D85E8'] as const;

const porcentaje = (v: number): string => `${(v * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;

export function useModoSimulacion(ctx: ContextoModo): ResultadoModo {
  const [vista, setVista] = useState<Vista>('cortina');
  const [palancas, setPalancas] = useState<Palancas>(PALANCAS_INICIALES);
  const [geometria, setGeometria] = useState<unknown>(null);
  const provincias = useProvincias();

  useEffect(() => {
    let vivo = true;
    void fetch('/geo/provincias.geojson')
      .then((r) => r.json())
      .then((g: unknown) => {
        if (vivo) setGeometria(g);
      })
      .catch(() => {
        /* sin geometría el modo lo dice; no rompe la página */
      });
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * `ahora` se congela con las señales y no con cada render: el motor es puro
   * y darle un reloj vivo lo volvería a recalcular sin que nadie tocara nada.
   */
  const resultado = useMemo(() => {
    const territorios = territoriosDesde(provincias.data ?? []);
    if (territorios.length === 0) return null;
    const base = estadoMedidoDesde(ctx.todas, provincias.data ?? [], Date.now());
    return simular({ palancas, base, territorios });
  }, [ctx.todas, provincias.data, palancas]);

  const capas = useMemo(() => {
    if (resultado === null) return { izquierda: null, derecha: null, diferencia: null };
    const silencio = coropleticoDe(geometria, resultado.silencio);
    const voz = coropleticoDe(geometria, resultado.voz);
    const dif = coropleticoDiferencia(geometria, resultado.diferencia);
    const techo = Math.max(maximoDe(voz), maximoDe(silencio));
    const rampa = RAMPAS.violeta?.colores ?? RAMPA_DIFERENCIA;
    return {
      izquierda: silencio ? <CapaProvincias id="sim-silencio" datos={silencio} maximo={techo} colores={rampa} /> : null,
      derecha: voz ? <CapaProvincias id="sim-voz" datos={voz} maximo={techo} colores={rampa} /> : null,
      diferencia: dif ? <CapaProvincias id="sim-diferencia" datos={dif} maximo={maximoDe(dif)} colores={RAMPA_DIFERENCIA} /> : null,
    };
  }, [resultado, geometria]);

  const superficie =
    vista === 'cortina' ? (
      <Cortina
        mapaRef={ctx.mapaRef}
        izquierda={capas.izquierda}
        derecha={capas.derecha}
        /* Con el país mudo, «Hoy» a secas no dice nada. «Hoy · nadie» convierte
           el lado vacío en la mitad del argumento. */
        etiquetaIzquierda={ctx.todas.length === 0 ? 'Hoy · nadie' : 'Hoy'}
        etiquetaDerecha="Si hablaran"
      />
    ) : null;

  return {
    titulo: 'Simulación',
    descripcion:
      vista === 'cortina'
        ? 'Arrastrá la línea. A la izquierda el país que se calló; a la derecha, el que habló.'
        : 'Solo lo que cambia: cuántas voces más, provincia por provincia.',
    panel: (
      <div className="flex flex-col gap-4">
        <Control etiqueta="Cómo comparar">
          <Segmentado
            valor={vista}
            opciones={[
              { id: 'cortina', etiqueta: 'Cortina' },
              { id: 'diferencia', etiqueta: 'Diferencia' },
            ]}
            onCambiar={setVista}
          />
        </Control>

        <PanelPalancas palancas={palancas} onCambiar={setPalancas} />

        {resultado === null ? (
          <p className="text-oscuro-tenue text-[11px]">
            Faltan las provincias para poder simular. Recargá en un momento.
          </p>
        ) : (
          <section>
            <h4 className="font-space text-oscuro-meta mb-1 text-[10px] uppercase tracking-[0.16em]">
              Si hablaran
            </h4>
            <Cifra etiqueta="Legitimidad" magnitud={resultado.voz.legitimidad} formato={porcentaje} />
            <Cifra etiqueta="Cobertura" magnitud={resultado.voz.cobertura} formato={porcentaje} />
            <Cifra
              etiqueta="Territorios que ganan mandato"
              magnitud={resultado.diferencia.territoriosQueGananMandato}
              formato={(v) => String(Math.round(v))}
            />
            <p className="text-oscuro-tenue mt-3 text-[10px] leading-snug">
              Diseño idealizado, no pronóstico: muestra lo que sería posible, no lo que va a pasar.
              El lado de hoy es medición y no se mueve con ninguna palanca.
            </p>
          </section>
        )}
      </div>
    ),
    capas: vista === 'diferencia' ? capas.diferencia : null,
    ...(superficie ? { superficie } : {}),
  };
}
