import { useCallback, useMemo, useState } from 'react';
import { Link } from 'wouter';

import { LENTES_DEL_CIELO, type LenteDelCielo } from '../lentes';
import {
  colorDeClase,
  etiquetaDeClase,
  resumenDelCielo,
  type NucleoEnPantalla,
  type Tema,
} from '../radiografia-data';

import { Constelacion } from './Constelacion';
import { FichaDeNucleo } from './FichaDeNucleo';
import { SelectorDelCielo } from './SelectorDelCielo';

import type { OrigenDelCielo } from '../constelacion-pintor';
import type { AristaDeConvergencia, MiembroDeNucleo } from '~/lib/queries/radiografia';

interface Props {
  nucleos: readonly NucleoEnPantalla[];
  solas: readonly MiembroDeNucleo[];
  aristas: readonly AristaDeConvergencia[];
  tema: Tema;
  origen: OrigenDelCielo;
  enfocado: string | null;
  onEnfocar: (id: string | null) => void;
  testId?: string;
  textosEjemplo?: Readonly<Record<string, string>>;
  compacto?: boolean;
}

const ZOOM_POR_LENTE: Record<LenteDelCielo, number> = {
  vinculos: 1.15,
  nucleos: 1.55,
  clases: 1.25,
};

export function ExploradorConstelacion({
  nucleos,
  solas,
  aristas,
  tema,
  origen,
  enfocado,
  onEnfocar,
  testId,
  textosEjemplo,
  compacto = false,
}: Props) {
  const [lente, setLente] = useState<LenteDelCielo>('nucleos');
  const [zoom, setZoom] = useState(ZOOM_POR_LENTE.nucleos);
  const [girando, setGirando] = useState(false);
  const [centrar, setCentrar] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [sobrevolado, setSobrevolado] = useState<string | null>(null);
  const elegir = useCallback((id: string | null) => {
    setSeleccion(id);
  }, []);
  const sobrevolar = useCallback((id: string | null) => {
    setSobrevolado(id);
  }, []);
  const todos = useMemo(
    () => [
      ...nucleos.flatMap((n) => n.miembros.map((m) => ({ ...m, nucleoId: n.id }))),
      ...solas.map((m) => ({ ...m, nucleoId: null })),
    ],
    [nucleos, solas],
  );
  const fuente = todos.find((m) => m.id === seleccion && m.nucleoId === enfocado) ?? null;
  const hover = todos.find((m) => m.id === sobrevolado) ?? null;
  const abierto = nucleos.find((n) => n.id === enfocado) ?? null;
  const lenteActual = LENTES_DEL_CIELO.find((l) => l.id === lente) ?? LENTES_DEL_CIELO[0];
  const nocturno = tema === 'nocturno';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-tinta';
  const meta = nocturno ? 'text-oscuro-secundario' : 'text-tinta-75';
  const cambiarLente = (id: LenteDelCielo) => {
    setLente(id);
    setZoom(ZOOM_POR_LENTE[id]);
    setCentrar((n) => n + 1);
  };
  const escoger = (m: { id: string; nucleoId: string | null }) => {
    onEnfocar(m.nucleoId);
    setSeleccion(m.id);
  };
  return (
    <section aria-label="Explorador visual de aportes" className={`border-2 ${borde}`}>
      <div
        className={`flex flex-wrap items-end justify-between gap-4 border-b ${borde} ${compacto ? 'px-4 py-3' : 'p-5'}`}
      >
        <div>
          <p className={`font-space text-xs uppercase tracking-[0.1em] ${meta}`}>
            {origen === 'ejemplo'
              ? 'Laboratorio · frases inventadas'
              : 'Aportes publicados · lectura en vivo'}
          </p>
          <h2
            className={
              compacto ? 'sr-only' : 'font-anton mt-2 text-[clamp(26px,3vw,38px)] leading-tight'
            }
          >
            Los mismos aportes, de tres maneras
          </h2>
        </div>
        <p className={`font-space text-xs ${meta}`}>
          {resumenDelCielo(todos.length, nucleos.length, solas.length)}
        </p>
      </div>
      <div
        className={`grid border-b ${borde} ${compacto ? 'grid-cols-3' : 'min-[561px]:grid-cols-3'}`}
        role="group"
        aria-label="Cómo ver los aportes"
      >
        {LENTES_DEL_CIELO.map((l, i) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={lente === l.id}
            onClick={() => {
              cambiarLente(l.id);
            }}
            className={`${compacto ? 'min-h-11 p-3' : 'min-h-16 p-4'} border-b text-left transition-colors min-[561px]:border-b-0 min-[561px]:border-r ${borde} ${lente === l.id ? 'bg-violeta text-papel' : 'hover:bg-papel-presionado hover:text-tinta'}`}
          >
            {/* El número es decoración: el nombre accesible es el texto visible
                («Líneas», «Grupos», «Por tipo») y nada más (WCAG 2.5.3). */}
            <span
              aria-hidden
              className={`font-space text-xs ${compacto ? 'max-[560px]:hidden' : ''}`}
            >
              0{i + 1}
            </span>
            <span
              className={`font-anton ${compacto ? 'text-lg min-[561px]:ml-3' : 'ml-3 text-xl'}`}
            >
              {l.titulo}
            </span>
          </button>
        ))}
      </div>
      <p className={`border-b ${borde} px-5 py-4 text-sm leading-relaxed ${meta}`}>
        <strong>{lenteActual.entrada}</strong> {lenteActual.lectura}
      </p>
      <div className="grid min-[961px]:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]">
        <div className={`min-w-0 border-b ${borde} min-[961px]:border-b-0 min-[961px]:border-r`}>
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b ${borde} px-4 py-3`}
          >
            <div className="flex gap-2" role="group" aria-label="Cámara de la constelación">
              <button
                type="button"
                aria-label="Acercar la constelación"
                disabled={zoom >= 2.8}
                onClick={() => {
                  setZoom((z) => Math.min(2.8, z + 0.25));
                }}
                className={`min-h-11 min-w-11 border ${borde} text-xl`}
              >
                +
              </button>
              <button
                type="button"
                aria-label="Alejar la constelación"
                disabled={zoom <= 0.6}
                onClick={() => {
                  setZoom((z) => Math.max(0.6, z - 0.25));
                }}
                className={`min-h-11 min-w-11 border ${borde} text-xl`}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(ZOOM_POR_LENTE[lente]);
                  setCentrar((n) => n + 1);
                }}
                className={`font-space min-h-11 border ${borde} px-3 text-xs`}
              >
                Reencuadrar
              </button>
              {lente === 'vinculos' && (
                <button
                  type="button"
                  aria-pressed={girando}
                  onClick={() => {
                    setGirando(!girando);
                  }}
                  className={`font-space min-h-11 border ${borde} px-3 text-xs`}
                >
                  {girando ? 'Pausar giro' : 'Girar'}
                </button>
              )}
            </div>
            <span className={`font-space text-xs ${meta}`}>{Math.round(zoom * 100)} %</span>
          </div>
          <div className="relative h-[390px] min-[561px]:h-[540px]">
            <Constelacion
              nucleos={nucleos}
              solas={solas}
              aristas={aristas}
              tema={tema}
              origen={origen}
              enfocado={abierto?.id ?? null}
              onEnfocar={onEnfocar}
              lente={lente}
              zoom={zoom}
              girando={girando}
              centrar={centrar}
              seleccionado={fuente?.id ?? sobrevolado}
              onSeleccionar={elegir}
              onSobrevolar={sobrevolar}
              onZoom={setZoom}
              {...(testId ? { testId } : {})}
            />
          </div>
          {/* La pista de uso va DEBAJO del lienzo y no encima: en el teléfono la
              leyenda flotante pisaba puntos del grafo. */}
          <p
            className={`font-space border-t ${borde} flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3 text-xs ${meta}`}
          >
            <span>
              {hover
                ? `${etiquetaDeClase(hover.clase)} · ${hover.nucleoId ? 'dentro de un grupo' : 'sin grupo'}`
                : lente === 'vinculos'
                  ? 'Arrastrá para girar. Tocá un aporte.'
                  : 'Arrastrá para desplazar. Tocá un aporte.'}
            </span>
            <span>Las posiciones solo acomodan.</span>
          </p>
          <ul
            aria-label="Colores de los aportes, por tipo"
            className={`flex flex-wrap gap-x-5 gap-y-3 border-t ${borde} px-5 py-4 text-sm`}
          >
            {['deseo', 'hecho', 'acto', 'meta'].map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colorDeClase(c, tema) }}
                />
                {etiquetaDeClase(c)}
              </li>
            ))}
          </ul>
          <p className={`border-t ${borde} px-5 py-3 text-[13px] leading-relaxed ${meta}`}>
            El tamaño marca cuántos aportes tiene el grupo, no cuánto importa.
            {solas.length > 0
              ? ' Los aportes que no se parecen a otros quedan afuera de los grupos: Sin grupo (la posición solo acomoda).'
              : ''}
          </p>
        </div>
        <div className="min-w-0 self-start">
          <div className={`border-b ${borde} p-5`}>
            <p className="font-space text-xs uppercase tracking-[0.1em]">Volver a un aporte</p>
            {fuente ? (
              <>
                <p className="font-anton mt-3 text-2xl">
                  {etiquetaDeClase(fuente.clase)} · {fuente.nucleoId ? 'en un grupo' : 'sin grupo'}
                </p>
                {origen === 'ejemplo' && textosEjemplo?.[fuente.id] ? (
                  <blockquote className="mt-3 text-lg leading-relaxed">
                    «{textosEjemplo[fuente.id]}»
                  </blockquote>
                ) : null}
                <p className={`mt-3 text-sm leading-relaxed ${meta}`}>
                  Un aporte conserva su sentido aunque cambie de lugar en el dibujo. Elegirlo no es
                  apoyarlo.
                </p>
                {origen === 'corpus' && /^voz:[0-9a-f-]{36}$/i.test(fuente.id) ? (
                  <Link
                    href={`/senal/${fuente.id.slice(4)}`}
                    className="mt-3 inline-flex min-h-11 items-center underline"
                  >
                    Abrir el aporte y sus permisos →
                  </Link>
                ) : null}
                {origen === 'ejemplo' ? (
                  <p className="text-sello mt-3 text-sm">Frase inventada. No es un aporte real.</p>
                ) : null}
              </>
            ) : (
              <p className={`mt-3 text-sm leading-relaxed ${meta}`}>
                Elegí un punto o un grupo para ver qué dice.
              </p>
            )}
          </div>
          <FichaDeNucleo
            nucleo={abierto}
            tema={tema}
            onCerrar={() => {
              onEnfocar(null);
              setSeleccion(null);
            }}
          />
        </div>
      </div>
      <SelectorDelCielo
        nucleos={nucleos}
        solas={solas}
        enfocado={enfocado}
        seleccionado={fuente?.id ?? null}
        tema={tema}
        elegirFuente={escoger}
        elegirNucleo={(id) => {
          onEnfocar(id);
          setSeleccion(null);
        }}
      />
    </section>
  );
}
