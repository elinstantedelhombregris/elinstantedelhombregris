import { useMemo, useState } from 'react';

import { FILL_CLASE, claseDeCategoria } from '../el-mapa-data';
import { Lienzo } from '../lienzo/Lienzo';
import { etiquetaDePrecision, precisionValida } from '../lienzo/precision';
import { useAltitud } from '../lienzo/useAltitud';

import { PopoverVoz } from './PopoverVoz';

import type { SenalDibujable } from '../lienzo/CapaSenales';
import type { VozAbierta } from '~/lib/queries/open-data';

import { PROVINCIAS_SVG } from '~/geo/pais.generated';
import { useProvincias, useVocesAbiertas, useVocesPorProvincia } from '~/lib/queries/open-data';

/**
 * El mapa (§2 de la spec original, reescrito por la spec 1 del programa
 * territorial): provincias precomputadas + señales dibujadas según la
 * precisión con la que fueron publicadas.
 *
 * Lo que murió acá: el jitter. Antes se dibujaba una espiral de puntos
 * alrededor del centroide provincial, y la leyenda avisaba que eran
 * decorativos. Eso alcanzaba mientras el mapa fuera una vitrina; con un lazo
 * encima pasa a ser una mentira medible, porque un punto inventado cae adentro
 * o afuera de un área igual que uno real. Ahora una voz que solo sabe su
 * provincia se dibuja como lavado sobre la provincia entera, y solo lo que
 * tiene coordenada se dibuja como punto (spec 1 §5).
 *
 * La unidad interactiva sigue siendo la provincia en altitud país: 24 tab-stops
 * como máximo, y el popover con su voz más reciente. Desde el popover se entra
 * a la provincia, que es el zoom por altitud de la spec 1 §4.
 */
export function MapaArgentina() {
  const provincias = useProvincias();
  const voces = useVocesAbiertas();
  const conteos = useVocesPorProvincia();
  const estado = useAltitud();
  const [sel, setSel] = useState<{ provinceId: number; idx: number } | null>(null);

  const nombrePorId = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.id, p.name])),
    [provincias.data],
  );
  const idPorNombre = useMemo(
    () => new Map((provincias.data ?? []).map((p) => [p.name, p.id])),
    [provincias.data],
  );

  const vocesPorProvincia = useMemo(() => {
    const mapa = new Map<number, VozAbierta[]>();
    for (const voz of voces.data ?? []) {
      if (voz.provinceId === null) continue;
      const lista = mapa.get(voz.provinceId) ?? [];
      lista.push(voz);
      mapa.set(voz.provinceId, lista);
    }
    return mapa;
  }, [voces.data]);

  /** El conteo autoritativo por provincia — cuenta más allá del cap de la lista. */
  const totalPorProvincia = useMemo(() => {
    const porId = new Map(
      (conteos.data ?? []).flatMap((c) =>
        c.provinceId === null ? [] : [[c.provinceId, c.count] as const],
      ),
    );
    const porNombre = new Map<string, number>();
    for (const [id, nombre] of nombrePorId) {
      const total = porId.get(id) ?? vocesPorProvincia.get(id)?.length ?? 0;
      if (total > 0) porNombre.set(nombre, total);
    }
    return porNombre;
  }, [conteos.data, nombrePorId, vocesPorProvincia]);

  /**
   * Solo las voces SIN coordenada alimentan el lavado provincial. Las que
   * tienen punto se dibujan donde están: contarlas de los dos lados inflaría
   * la mancha con señales que ya se ven.
   */
  const conteoProvincial = useMemo(() => {
    const porNombre = new Map<string, number>();
    for (const voz of voces.data ?? []) {
      if (voz.provinceId === null || typeof voz.lat === 'number') continue;
      const nombre = nombrePorId.get(voz.provinceId);
      if (nombre === undefined) continue;
      porNombre.set(nombre, (porNombre.get(nombre) ?? 0) + 1);
    }
    return porNombre;
  }, [voces.data, nombrePorId]);

  const senales = useMemo<SenalDibujable[]>(
    () =>
      (voces.data ?? [])
        .filter((voz) => typeof voz.lat === 'number' && typeof voz.lng === 'number')
        .map((voz) => {
          const precision = precisionValida(voz.precision);
          const clase = claseDeCategoria(voz.category);
          return {
            id: `voz-${String(voz.id)}`,
            lat: voz.lat,
            lng: voz.lng,
            precision: voz.precision,
            fill: clase === null ? 'fill-tinta-50' : FILL_CLASE[clase],
            etiqueta: `${voz.category ?? 'sin tipo'}: «${voz.body.slice(0, 80)}» — ${etiquetaDePrecision(precision)}`,
          };
        }),
    [voces.data],
  );

  const activables = useMemo(
    () => new Set([...totalPorProvincia.keys()].filter((nombre) => idPorNombre.has(nombre))),
    [totalPorProvincia, idPorNombre],
  );

  const cargando = voces.isLoading || provincias.isLoading;
  const sinVoces = !cargando && !voces.isError && (voces.data?.length ?? 0) === 0;
  const vocesSel = sel ? (vocesPorProvincia.get(sel.provinceId) ?? []) : [];
  const conPunto = senales.length;
  const sinPunto = (voces.data?.length ?? 0) - conPunto;

  const cerrar = () => {
    if (sel) document.getElementById(`prov-${nombrePorId.get(sel.provinceId) ?? ''}`)?.focus();
    setSel(null);
  };

  const verDeCerca = () => {
    if (!sel) return;
    const nombre = nombrePorId.get(sel.provinceId);
    const prov = PROVINCIAS_SVG.find((p) => p.nombre === nombre);
    if (!prov) return;
    estado.entrarA(prov);
    setSel(null);
  };

  /**
   * La leyenda nombra la precisión de lo que se está mirando. La vieja
   * («ubicada en su provincia — no en una dirección») dejó de ser verdad el día
   * que una voz se pudo clavar en un punto: bajo D7 la precisión la elige quien
   * habla, y afirmar una sola es mentir sobre las demás.
   */
  const leyenda = cargando
    ? 'Cargando — menos que un trámite.'
    : voces.isError
      ? 'Esto se rompió. Lo decimos porque publicamos todo.'
      : sinVoces
        ? 'Todavía no hay voces acá. Qué oportunidad.'
        : conPunto === 0
          ? 'Todas las voces de este mapa están ubicadas a nivel provincia: por eso se dibujan como una mancha sobre la provincia entera y no como puntos.'
          : `${String(conPunto)} ${conPunto === 1 ? 'voz tiene' : 'voces tienen'} un lugar propio y se dibujan ahí; el halo es cuánto se sabe. Las otras ${String(sinPunto)} solo saben su provincia y se dibujan como mancha.`;

  return (
    <div className="border-tinta bg-papel-crudo relative border p-7 max-[560px]:p-4">
      <Lienzo
        estado={estado}
        senales={senales}
        conteoProvincial={conteoProvincial}
        totalPorProvincia={totalPorProvincia}
        activables={activables}
        etiquetaProvincia={(nombre, total) =>
          `${nombre}: ${String(total)} ${total === 1 ? 'voz' : 'voces'}. Leer la última.`
        }
        onProvincia={(prov) => {
          const provinceId = idPorNombre.get(prov.nombre);
          if (provinceId !== undefined) setSel({ provinceId, idx: 0 });
        }}
      />

      {sel && vocesSel.length > 0 ? (
        <PopoverVoz
          key={sel.provinceId}
          provincia={nombrePorId.get(sel.provinceId) ?? 'Argentina'}
          voces={vocesSel}
          idx={sel.idx}
          onCiclar={() => {
            setSel({ provinceId: sel.provinceId, idx: (sel.idx + 1) % vocesSel.length });
          }}
          onCerrar={cerrar}
          onVerDeCerca={verDeCerca}
        />
      ) : null}

      <p className="font-space text-tinta-50 mt-4 text-[10px] uppercase tracking-[0.12em]">
        {leyenda}
      </p>
    </div>
  );
}
