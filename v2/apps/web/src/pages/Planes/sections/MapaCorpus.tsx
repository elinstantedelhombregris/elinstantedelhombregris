import { useId, useMemo } from 'react';
import { Link } from 'wouter';

import { PLAN_COUNT } from '../la-prueba-data';
import {
  LADO,
  RADIO,
  arcoDeGrupo,
  grosorDeVinculo,
  layoutMapa,
  puntoEn,
  radioDeNodo,
  trazoDeVinculo,
  useMapaCorpus,
  vinculosDe,
} from '../mapa-corpus';

import type { LayoutMapa, MapaCorpusData, PlanDelMapa, VinculoDelMapa } from '../mapa-corpus';
import type { KeyboardEvent } from 'react';

import { BotonPapel } from '~/components/papel/primitives';

const nf = new Intl.NumberFormat('es-AR');

export interface MapaCorpusProps {
  /** Slug del plan seleccionado (compartido con el índice) o null. */
  seleccionado: string | null;
  onSeleccionar: (slug: string | null) => void;
}

/** El mapa de cómo se apoyan los planes: navegador del índice, no herramienta de análisis. */
export function MapaCorpus({ seleccionado, onSeleccionar }: MapaCorpusProps) {
  const mapa = useMapaCorpus();

  return (
    <section
      aria-label="Mapa de los planes"
      className="mx-auto max-w-[1440px] px-10 pb-[72px] max-[560px]:px-5"
    >
      {mapa.estado === 'error' ? (
        <p className="font-space text-tinta-50 border-tinta border-t pt-5 text-[11px] uppercase tracking-[0.12em]">
          El mapa no cargó. El índice de abajo tiene los mismos planes.
        </p>
      ) : (
        <div className="border-tinta grid grid-cols-[55fr_45fr] gap-10 border-t pt-8 max-[960px]:grid-cols-1">
          {mapa.estado === 'cargando' ? (
            <div className="bg-papel-crudo font-space text-tinta-50 flex aspect-square w-full items-center justify-center text-[11px] uppercase tracking-[0.12em]">
              Dibujando el mapa…
            </div>
          ) : (
            <Cuerpo datos={mapa.datos} seleccionado={seleccionado} onSeleccionar={onSeleccionar} />
          )}
        </div>
      )}
    </section>
  );
}

function Cuerpo({
  datos,
  seleccionado,
  onSeleccionar,
}: MapaCorpusProps & { datos: MapaCorpusData }) {
  const indice =
    seleccionado === null ? -1 : datos.planes.findIndex((p) => p.slug === seleccionado);
  const plan = indice === -1 ? undefined : datos.planes[indice];
  const layout = useMemo(() => layoutMapa(datos.planes), [datos.planes]);

  return (
    <>
      <RedSvg datos={datos} layout={layout} indice={indice} onSeleccionar={onSeleccionar} />
      <div>
        <SelectorDePlan
          datos={datos}
          orden={layout.orden}
          seleccionado={seleccionado}
          onSeleccionar={onSeleccionar}
        />
        {plan ? (
          <PanelPlan datos={datos} plan={plan} indice={indice} onSeleccionar={onSeleccionar} />
        ) : (
          <PanelGeneral datos={datos} />
        )}
      </div>
    </>
  );
}

function SelectorDePlan({
  datos,
  orden,
  seleccionado,
  onSeleccionar,
}: MapaCorpusProps & { datos: MapaCorpusData; orden: number[] }) {
  const id = useId();
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="font-space text-tinta-50 mb-2 block text-[11px] uppercase tracking-[0.16em]"
      >
        Elegí un plan
      </label>
      <select
        id={id}
        value={seleccionado ?? ''}
        onChange={(e) => {
          onSeleccionar(e.target.value === '' ? null : e.target.value);
        }}
        className="border-tinta bg-papel-crudo font-space text-tinta w-full max-w-[360px] border px-3 py-2 text-[13px]"
      >
        <option value="">Todo el mapa</option>
        {orden.map((i) => {
          const p = datos.planes[i];
          return p ? (
            <option key={p.slug} value={p.slug}>
              {`${p.code} — ${p.nombre}`}
            </option>
          ) : null;
        })}
      </select>
    </div>
  );
}

function RedSvg({
  datos,
  layout,
  indice,
  onSeleccionar,
}: {
  datos: MapaCorpusData;
  layout: LayoutMapa;
  indice: number;
  onSeleccionar: (slug: string | null) => void;
}) {
  const hay = indice !== -1;

  const relacion = (v: VinculoDelMapa): 'recibe' | 'aporta' | 'otro' | 'reposo' => {
    if (!hay) return 'reposo';
    if (v.a === indice) return 'recibe';
    if (v.b === indice) return 'aporta';
    return 'otro';
  };
  const vinculos = datos.vinculos.map((v, k) => ({ v, k, rel: relacion(v) }));
  // Lo resaltado se dibuja encima.
  const pintados = [
    ...vinculos.filter((x) => x.rel === 'reposo' || x.rel === 'otro'),
    ...vinculos.filter((x) => x.rel === 'recibe' || x.rel === 'aporta'),
  ];
  const recibeDe = new Set<number>();
  const aportaA = new Set<number>();
  for (const { v, rel } of pintados) {
    if (rel === 'recibe') recibeDe.add(v.b);
    if (rel === 'aporta') aportaA.add(v.a);
  }

  const alternar = (slug: string, activo: boolean) => {
    onSeleccionar(activo ? null : slug);
  };

  return (
    <div>
      <svg
        viewBox={`0 0 ${LADO} ${LADO}`}
        role="group"
        aria-label="Red de los planes y sus vínculos"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {pintados.map(({ v, k, rel }) => {
          const aA = layout.angulos[v.a];
          const aB = layout.angulos[v.b];
          if (aA === undefined || aB === undefined) return null;
          const recibe = rel === 'recibe';
          const aporta = rel === 'aporta';
          return (
            <path
              key={k}
              d={trazoDeVinculo(aA, aB)}
              fill="none"
              className={recibe ? 'stroke-violeta' : aporta ? 'stroke-verde' : 'stroke-tinta'}
              strokeWidth={grosorDeVinculo(v.peso)}
              strokeOpacity={recibe || aporta ? 0.85 : rel === 'otro' ? 0.04 : 0.16}
              strokeDasharray={recibe ? '5 3' : undefined}
              aria-hidden="true"
            />
          );
        })}

        {layout.grupos.map((g) => {
          const arco = arcoDeGrupo(g);
          return (
            <g key={g.grupo} aria-hidden="true">
              <path d={arco.d} fill="none" className="stroke-tinta-30" strokeWidth={1} />
              <text
                x={arco.xEtiqueta}
                y={arco.yEtiqueta}
                textAnchor={arco.ancla}
                className="font-space fill-tinta-50 text-[11px] uppercase tracking-[0.12em] max-[560px]:hidden"
              >
                {g.etiqueta}
              </text>
            </g>
          );
        })}

        {layout.orden.map((i) => {
          const p = datos.planes[i];
          const ang = layout.angulos[i];
          if (!p || ang === undefined) return null;
          const [x, y] = puntoEn(ang);
          const r = radioDeNodo(p.nombradoPor);
          const activo = i === indice;
          const izq = Math.cos(ang) < 0;
          const grados = (ang * 180) / Math.PI;
          const [lx, ly] = puntoEn(ang, RADIO + r + 7);
          const relacionado = recibeDe.has(i) || aportaA.has(i);
          const apagado = hay && !activo && !relacionado;
          const anillo = recibeDe.has(i)
            ? 'stroke-violeta'
            : aportaA.has(i)
              ? 'stroke-verde'
              : 'stroke-tinta';
          return (
            <g
              key={p.slug}
              role="button"
              tabIndex={0}
              aria-pressed={activo}
              aria-label={`${p.code} — ${p.nombre}`}
              opacity={apagado ? 0.3 : 1}
              className="[&:focus-visible>circle]:stroke-violeta cursor-pointer outline-none [&:focus-visible>circle]:[stroke-width:3]"
              onClick={() => {
                alternar(p.slug, activo);
              }}
              onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alternar(p.slug, activo);
                }
              }}
            >
              <title>{`${p.code} — ${p.nombre}`}</title>
              <circle cx={x} cy={y} r={18} fill="transparent" stroke="none" />
              <circle
                cx={x}
                cy={y}
                r={r}
                strokeWidth={relacionado ? 2 : 1.25}
                className={`${anillo} ${activo ? 'fill-tinta' : 'fill-papel'}`}
              />
              <text
                transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${izq ? grados + 180 : grados})`}
                textAnchor={izq ? 'end' : 'start'}
                dy={3.5}
                className={`font-space text-[10px] ${activo ? 'fill-tinta font-bold' : 'fill-tinta-75 max-[560px]:hidden'}`}
              >
                {p.code}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="font-space text-tinta-75 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.1em]">
        <li>Cada línea: algo que un plan le da a otro</li>
        <li>Tamaño: cuántas veces lo nombran los demás</li>
        <li className="min-[561px]:hidden">En el teléfono, elegí el plan en la lista de abajo</li>
        {hay ? (
          <>
            <li className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden="true">
                <line
                  x1="0"
                  y1="3"
                  x2="28"
                  y2="3"
                  className="stroke-violeta"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              </svg>
              Línea punteada violeta: recibe de
            </li>
            <li className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="28" y2="3" className="stroke-verde" strokeWidth="2" />
              </svg>
              Línea llena verde: le aporta a
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

function PanelGeneral({ datos }: { datos: MapaCorpusData }) {
  const abiertas = datos.desarmonias.rota + datos.desarmonias.revisar;
  const cifras: [string, string][] = [
    [nf.format(datos.canon.palabras), 'palabras del corpus'],
    [nf.format(datos.vinculos.length), 'vínculos'],
    [nf.format(abiertas), 'desarmonías abiertas'],
  ];
  return (
    <div>
      <p className="font-space text-violeta mb-3 text-[11px] uppercase tracking-[0.16em]">
        El mapa · tocá un plan
      </p>
      <p className="font-anton text-tinta mb-4 text-4xl leading-tight">
        {PLAN_COUNT} planes y un plan meta
      </p>
      <p className="text-tinta-90 mb-6 max-w-[520px] text-base leading-relaxed [text-wrap:pretty]">
        Cada círculo es un documento. Cada línea, algo que un plan le da a otro. Tocá uno para ver
        qué propone, de quién recibe y a quién le aporta.
      </p>
      <dl className="border-tinta mb-6 grid grid-cols-3 gap-4 border-t pt-4">
        {cifras.map(([valor, rotulo]) => (
          <div key={rotulo}>
            <dt className="font-space text-tinta-50 text-[10px] uppercase tracking-[0.12em]">
              {rotulo}
            </dt>
            <dd className="font-anton text-tinta text-2xl">{valor}</dd>
          </div>
        ))}
      </dl>
      {/* `<a>` y no `<Link>`: el atlas es una página estática (`public/atlas/`), fuera del router. */}
      <a
        href="/atlas/"
        className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
      >
        Análisis del corpus en profundidad →
      </a>
    </div>
  );
}

function Chips({
  titulo,
  items,
  planes,
  campo,
  onSeleccionar,
}: {
  titulo: string;
  items: VinculoDelMapa[];
  planes: PlanDelMapa[];
  campo: 'a' | 'b';
  onSeleccionar: (slug: string | null) => void;
}) {
  return (
    <div className="mb-4">
      <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.12em]">
        {titulo} {items.length}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((v) => {
          const otro = planes[v[campo]];
          if (!otro) return null;
          return (
            <li key={`${v.a}-${v.b}`}>
              <button
                type="button"
                title={v.que ?? undefined}
                onClick={() => {
                  onSeleccionar(otro.slug);
                }}
                className="font-space border-tinta text-tinta hover:bg-tinta hover:text-papel border px-2 py-1 text-[11px] uppercase tracking-[0.08em] transition-colors duration-150"
              >
                {otro.code}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PanelPlan({
  datos,
  plan,
  indice,
  onSeleccionar,
}: {
  datos: MapaCorpusData;
  plan: PlanDelMapa;
  indice: number;
  onSeleccionar: (slug: string | null) => void;
}) {
  const { recibe, aporta } = vinculosDe(datos, indice);
  const abiertas = plan.desarmonias.rota + plan.desarmonias.revisar;
  return (
    <div>
      <p className="font-anton text-tinta mb-1 text-4xl leading-tight">{plan.code}</p>
      <p className="text-tinta-75 mb-4 text-[15px] leading-snug">{plan.nombre}</p>
      {plan.tesis ? (
        <p className="text-tinta mb-3 max-w-[560px] text-lg leading-snug [text-wrap:pretty]">
          {plan.tesis}
        </p>
      ) : null}
      {plan.resumen ? (
        <p className="text-tinta-90 mb-5 max-w-[560px] text-base leading-relaxed [text-wrap:pretty]">
          {plan.resumen}
        </p>
      ) : null}

      <Chips
        titulo="Recibe de"
        items={recibe}
        planes={datos.planes}
        campo="b"
        onSeleccionar={onSeleccionar}
      />
      <Chips
        titulo="Le aporta a"
        items={aporta}
        planes={datos.planes}
        campo="a"
        onSeleccionar={onSeleccionar}
      />

      {abiertas > 0 ? (
        <p className="font-space text-tinta-75 mb-5 text-[11px] uppercase tracking-[0.1em]">
          {/* `<a>` y no `<Link>`: el atlas es una página estática, fuera del router. */}
          <a href={`/atlas/#desarmonias-${plan.slug}`} className="text-violeta font-bold">
            {abiertas} {abiertas === 1 ? 'desarmonía abierta' : 'desarmonías abiertas'} →
          </a>
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={`/planes/${plan.slug}`}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          Leer el documento →
        </Link>
        {/* `<a>` y no `<Link>`: el atlas es una página estática, fuera del router. */}
        <a
          href={`/atlas/#editar-${plan.slug}`}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          Analizar en profundidad →
        </a>
      </div>

      <BotonPapel
        variant="fantasma"
        className="!px-4 !py-2 !text-[11px]"
        onClick={() => {
          onSeleccionar(null);
        }}
      >
        Ver todo el mapa
      </BotonPapel>
    </div>
  );
}
