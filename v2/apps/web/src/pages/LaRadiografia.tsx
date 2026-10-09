import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';

import {
  CLASES_DE_NOCHE,
  guardarTema,
  leerTema,
  type Orden,
  type Tema,
} from './LaRadiografia/radiografia-data';
import { construirVista } from './LaRadiografia/radiografia-vista';
import { CabeceraProcedencia } from './LaRadiografia/sections/CabeceraProcedencia';
import { CieloVacio } from './LaRadiografia/sections/CieloVacio';
import { ComoLeerElCielo } from './LaRadiografia/sections/ComoLeerElCielo';
import { ControlesAnalisis } from './LaRadiografia/sections/ControlesAnalisis';
import { DeslizadorUmbral } from './LaRadiografia/sections/DeslizadorUmbral';
import { ExploradorConstelacion } from './LaRadiografia/sections/ExploradorConstelacion';
import { InterruptorDeTema } from './LaRadiografia/sections/InterruptorDeTema';
import { LecturaOpiniones } from './LaRadiografia/sections/LecturaOpiniones';
import { ListaDeNucleos } from './LaRadiografia/sections/ListaDeNucleos';
import { RegimenDegenerado } from './LaRadiografia/sections/RegimenDegenerado';

import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { filtrosPublicos } from '~/lib/participacion/exportar';
import { UMBRAL_INICIAL, useRadiografia } from '~/lib/queries/radiografia';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';
import { cuantos } from '~/lib/vocabulario';

function umbralInicial() {
  const n = Number(new URLSearchParams(window.location.search).get('umbral'));
  return n >= 0.3 && n <= 0.95 ? n : UMBRAL_INICIAL;
}

/** El grafo real y el laboratorio sintético conservan rutas, fuentes y sellos separados. */
export function LaRadiografia() {
  useTituloDePagina('La Radiografía');
  const [filtros, setFiltros] = useState(() =>
    filtrosPublicos(Object.fromEntries(new URLSearchParams(window.location.search))),
  );
  const [umbral, setUmbral] = useState(umbralInicial);
  const [umbralPedido, setUmbralPedido] = useState(umbralInicial);
  const [orden, setOrden] = useState<Orden>('tamano');
  const [enfocado, setEnfocado] = useState<string | null>(null);
  const [tema, setTema] = useState<Tema>('papel');
  const [alcanceAbierto, setAlcanceAbierto] = useState(false);
  useEffect(() => {
    setTema(leerTema());
  }, []);
  useEffect(() => {
    const reloj = setTimeout(() => {
      setUmbralPedido(umbral);
      window.history.replaceState(
        null,
        '',
        `/la-radiografia?${new URLSearchParams({ ...filtros, umbral: umbral.toFixed(2) }).toString()}`,
      );
    }, 350);
    return () => {
      clearTimeout(reloj);
    };
  }, [umbral, filtros]);
  const { data, isLoading, isError } = useRadiografia({ umbral: umbralPedido, filtros });
  const vista = useMemo(() => construirVista(data, umbral), [data, umbral]);
  const enfocar = useCallback((id: string | null) => {
    setEnfocado(id);
  }, []);
  const dibujables = vista.nucleos.reduce((total, n) => total + n.senales, 0) + vista.solas.length;
  const aristas = useMemo(
    () =>
      (data?.aristas ?? []).filter(
        (a) =>
          a.tipo === 'declarada' ||
          a.similitud >= (vista.origen === 'esperando' ? (data?.umbral ?? umbral) : umbral),
      ),
    [data, vista.origen, umbral],
  );
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-secundario' : 'text-tinta-75';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-tinta';
  const cambiarTema = (nuevo: Tema) => {
    setTema(nuevo);
    guardarTema(nuevo);
  };
  const cambiarFiltros = (f: Record<string, string>) => {
    setFiltros(filtrosPublicos(f));
    setEnfocado(null);
  };
  const consulta = { ...filtros, umbral: umbral.toFixed(2) };
  return (
    <main className={nocturno ? CLASES_DE_NOCHE : ''}>
      <div className="mx-auto max-w-[1440px] px-10 py-10 max-[560px]:px-5">
        <div className="max-w-[780px]">
          <Kicker className="mb-3">Los aportes, agrupados por parecido</Kicker>
          <h1
            aria-label="La Radiografía."
            className="font-anton mb-4 text-[clamp(44px,6vw,84px)] leading-[0.98]"
          >
            <RitoTinta lineas={['La Radiografía.']} tono={nocturno ? 'claro' : 'tinta'} />
          </h1>
          <p className={`max-w-[690px] text-lg leading-relaxed ${meta}`}>
            La Radiografía agrupa los aportes según qué tan parecido es su texto. No es una encuesta
            ni dice qué piensa el país.
          </p>
        </div>
        <nav aria-label="Recorrido de Radiografía" className="my-6 flex flex-wrap gap-3">
          <a
            href="#patrones"
            className={`font-space inline-flex min-h-11 items-center border ${borde} px-4 text-xs uppercase`}
          >
            Explorar patrones ↓
          </a>
          <a
            href="#acuerdos"
            className={`font-space inline-flex min-h-11 items-center border ${borde} px-4 text-xs uppercase`}
          >
            Acuerdos y diferencias ↓
          </a>
          <Link
            href="/la-radiografia/ejemplo"
            className="font-space bg-violeta text-papel inline-flex min-h-11 items-center px-4 text-xs uppercase"
          >
            Explorar un ejemplo →
          </Link>
          {/* Después de los accesos de verdad: era el primer botón de la pantalla
              en el teléfono, y es un gusto, no un camino. */}
          <InterruptorDeTema tema={tema} onCambiar={cambiarTema} />
        </nav>
        <div
          className={`mb-5 flex flex-wrap items-center justify-between gap-4 border-y ${borde} py-3`}
        >
          <p className={`font-space text-xs ${meta}`}>
            {Object.keys(filtros).length
              ? cuantos(Object.keys(filtros).length, 'filtro elegido', 'filtros elegidos')
              : 'Todo el país · todos los aportes elegibles'}
          </p>
          <div className="flex flex-wrap gap-5">
            <button
              type="button"
              aria-expanded={alcanceAbierto}
              aria-controls="alcance-radiografia"
              onClick={() => {
                setAlcanceAbierto(!alcanceAbierto);
              }}
              className="font-space min-h-11 text-xs underline"
            >
              {alcanceAbierto ? 'Cerrar alcance y herramientas' : 'Alcance, compartir y guardar'}
            </button>
            <Link
              href={`/datos-abiertos?${new URLSearchParams(consulta).toString()}`}
              className="font-space inline-flex min-h-11 items-center text-xs underline"
            >
              Descargar estos datos →
            </Link>
          </div>
        </div>
        {alcanceAbierto ? (
          <div id="alcance-radiografia">
            <ControlesAnalisis
              filtros={consulta}
              cambiar={cambiarFiltros}
              corte={data?.corte ?? null}
            />
          </div>
        ) : null}
        <CabeceraProcedencia
          datos={data}
          cargando={isLoading}
          fallo={isError}
          tema={tema}
          compacto
        />
        <div id="patrones" className="scroll-mt-24">
          {/* El aviso que sostiene todo lo demás, arriba del primer gráfico y a la
              vista en cualquier ancho: antes estaba en 14 px o escondido. */}
          <p
            className={`mb-5 border-l-4 py-1 pl-4 text-[17px] font-semibold leading-snug ${borde} ${nocturno ? 'text-oscuro-texto' : 'text-tinta'}`}
          >
            Que muchos aportes digan lo mismo no prueba que sea cierto. Contamos aportes, no
            personas.
          </p>
          {isError && !data ? (
            <p role="alert" className={`border py-16 text-center ${nocturno ? 'border-oscuro-borde' : ''}`}>
              No pudimos cargar el análisis. Probá de nuevo en un rato.
            </p>
          ) : isLoading ? (
            <p role="status" className={`border py-20 text-center ${nocturno ? 'border-oscuro-borde' : ''}`}>
              Reuniendo los aportes…
            </p>
          ) : dibujables < 2 ? (
            <>
              <CieloVacio
                analizadas={data?.analizadas ?? 0}
                sinVector={data?.sinVector ?? 0}
                corrio={Boolean(data?.corte)}
                tema={tema}
              />
              <Link
                href="/la-radiografia/ejemplo"
                className="font-space mt-4 inline-flex min-h-11 items-center text-sm underline"
              >
                Abrir el laboratorio, con frases inventadas →
              </Link>
            </>
          ) : (
            <>
              <RegimenDegenerado regimen={data?.regimenDegenerado ?? null} tema={tema} />
              <ComoLeerElCielo tema={tema} />
              <ExploradorConstelacion
                nucleos={vista.nucleos}
                solas={vista.solas}
                aristas={aristas}
                tema={tema}
                origen="corpus"
                enfocado={enfocado}
                onEnfocar={enfocar}
              />
              <div className="my-6">
                <DeslizadorUmbral
                  umbral={umbral}
                  onCambiar={setUmbral}
                  origen={vista.origen}
                  nucleos={vista.nucleos.length}
                  solas={vista.solas.length}
                  tema={tema}
                />
              </div>
              <ListaDeNucleos
                nucleos={vista.nucleos}
                orden={orden}
                onOrdenar={setOrden}
                enfocado={enfocado}
                onEnfocar={enfocar}
                tema={tema}
              />
            </>
          )}
        </div>
        <LecturaOpiniones
          key={`${filtros.campana ?? ''}:${filtros.territorio ?? ''}`}
          filtros={filtros}
        />
        <nav aria-label="El ejemplo de La Radiografía" className={`mt-12 border-t-2 ${borde} pt-8`}>
          <Kicker className="mb-3">El laboratorio</Kicker>
          <Link
            href="/la-radiografia/ejemplo"
            className="font-anton block text-[clamp(26px,3vw,40px)] underline underline-offset-4"
          >
            Ver un ejemplo, con frases inventadas →
          </Link>
          <p className={`mt-3 max-w-[750px] text-sm leading-relaxed ${meta}`}>
            Son las mismas frases escritas de tres maneras, para ver cómo cambia el resultado.
            Ninguna es un aporte real: el laboratorio tiene su propia pantalla y un sello dentro de
            la imagen.
          </p>
        </nav>
      </div>
    </main>
  );
}
export default LaRadiografia;
