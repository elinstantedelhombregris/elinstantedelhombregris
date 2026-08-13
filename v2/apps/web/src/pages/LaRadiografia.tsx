import { useCallback, useEffect, useMemo, useState } from 'react';

import { guardarTema, leerTema, type Orden, type Tema } from './LaRadiografia/radiografia-data';
import { construirVista } from './LaRadiografia/radiografia-vista';
import { CabeceraProcedencia } from './LaRadiografia/sections/CabeceraProcedencia';
import { CieloVacio } from './LaRadiografia/sections/CieloVacio';
import { Constelacion } from './LaRadiografia/sections/Constelacion';
import { DeslizadorUmbral } from './LaRadiografia/sections/DeslizadorUmbral';
import { FichaDeNucleo } from './LaRadiografia/sections/FichaDeNucleo';
import { ListaDeNucleos } from './LaRadiografia/sections/ListaDeNucleos';

import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { UMBRAL_INICIAL, useRadiografia } from '~/lib/queries/radiografia';

/**
 * La Radiografía — la convergencia como instrumento.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md`.
 *
 * Las cinco lentes de `/el-mapa` contestan **dónde**, **cuándo** y **cuánto**.
 * Ninguna contesta **sobre qué, y estamos de acuerdo**. Esta página es la
 * cuarta superficie que la constitución de producto ya nombra.
 *
 * Tres piezas y un orden que no es decorativo:
 *
 *  1. la **cabecera de procedencia**, que no se puede cerrar (regla 5);
 *  2. la **constelación** y su **deslizador**, que es el mando (R7);
 *  3. la **lista**, que es el camino accesible al mismo estado (R11) y **sale
 *     junto con la constelación, nunca después** (§10, rebanada 4).
 */

/** Espera antes de repedirle al servidor. El navegador ya recalculó mientras. */
const ESPERA_DEL_PEDIDO = 350;

export function LaRadiografia() {
  const [umbral, setUmbral] = useState(UMBRAL_INICIAL);
  const [umbralPedido, setUmbralPedido] = useState(UMBRAL_INICIAL);
  const [orden, setOrden] = useState<Orden>('tamano');
  const [enfocado, setEnfocado] = useState<string | null>(null);
  const [tema, setTema] = useState<Tema>('papel');

  useEffect(() => {
    setTema(leerTema());
  }, []);

  // El deslizador se mueve en el navegador y el servidor se entera después:
  // los núcleos se recalculan al instante con el mismo `nucleosAlUmbral` de
  // `@v2/civic-core`, y el pedido sale cuando el lector deja de arrastrar.
  useEffect(() => {
    const reloj = setTimeout(() => {
      setUmbralPedido(umbral);
    }, ESPERA_DEL_PEDIDO);
    return () => {
      clearTimeout(reloj);
    };
  }, [umbral]);

  const { data, isLoading, isError } = useRadiografia({ umbral: umbralPedido });
  const vista = useMemo(() => construirVista(data, umbral), [data, umbral]);

  const cambiarTema = (nuevo: Tema) => {
    setTema(nuevo);
    guardarTema(nuevo);
  };

  // El enfoque se pasa por referencia estable: el bucle de la constelación lo
  // guarda y no queremos que un `onEnfocar` nuevo por render lo reinicie.
  const enfocar = useCallback((id: string | null) => {
    setEnfocado(id);
  }, []);

  const nucleoAbierto = vista.nucleos.find((n) => n.id === enfocado) ?? null;
  const dibujables = vista.nucleos.reduce((total, n) => total + n.senales, 0) + vista.solas.length;
  const nocturno = tema === 'nocturno';

  return (
    <main
      className={nocturno ? 'bg-oscuro-barra text-oscuro-texto' : ''}
      style={nocturno ? { minHeight: '100vh' } : undefined}
    >
      <div className="mx-auto max-w-[1180px] px-10 py-[72px] max-[560px]:px-5">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <Kicker className="anim-fadeup mb-4">La cuarta superficie</Kicker>
            <h1
              aria-label="La Radiografía."
              className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,84px)] leading-[0.98]"
            >
              <RitoTinta lineas={['La Radiografía.']} />
            </h1>
            <p
              className={`anim-fadeup max-w-[640px] text-pretty text-[18px] leading-[1.6] ${
                nocturno ? 'text-oscuro-secundario' : 'text-tinta-75'
              }`}
              style={{ animationDelay: '0.9s' }}
            >
              El mapa dice dónde se habló y cuándo. Esto dice sobre qué, y quiénes dijeron casi lo
              mismo sin conocerse. Converger no es corroborar: que muchas personas escriban lo mismo
              es evidencia de que muchas personas escribieron lo mismo, y ya es mucho.
            </p>
          </div>

          <InterruptorDeTema tema={tema} onCambiar={cambiarTema} />
        </div>

        <CabeceraProcedencia datos={data} cargando={isLoading} fallo={isError} tema={tema} />

        {isError && !data ? (
          // El vacío es una pieza y una afirmación: «todavía no habló nadie».
          // Cuando el pedido falla no sabemos si habló alguien, así que no se
          // dice. Se dice lo que pasó.
          <p
            className={`py-16 text-center text-[16px] ${nocturno ? 'text-oscuro-meta' : 'text-tinta-50'}`}
          >
            No se pudo traer el análisis. Recargá en un momento.
          </p>
        ) : dibujables < 2 ? (
          <CieloVacio
            analizadas={data?.analizadas ?? 0}
            sinVector={data?.sinVector ?? 0}
            tema={tema}
          />
        ) : (
          <>
            {/* φ y sólo acá: 1,618fr de constelación a 1fr de ficha (§5.6.5).
                Nada de φ entra en el umbral ni en un número publicado (R10). */}
            <div className="grid gap-0 lg:grid-cols-[1.618fr_1fr]">
              <div className="h-[520px] w-full">
                <Constelacion
                  nucleos={vista.nucleos}
                  solas={vista.solas}
                  aristas={data?.aristas ?? []}
                  tema={tema}
                  enfocado={enfocado}
                  onEnfocar={enfocar}
                />
              </div>
              <FichaDeNucleo
                nucleo={nucleoAbierto}
                tema={tema}
                onCerrar={() => {
                  setEnfocado(null);
                }}
              />
            </div>

            <div className="mt-8">
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
    </main>
  );
}

function InterruptorDeTema({ tema, onCambiar }: { tema: Tema; onCambiar: (t: Tema) => void }) {
  const nocturno = tema === 'nocturno';
  return (
    <button
      type="button"
      aria-pressed={nocturno}
      onClick={() => {
        onCambiar(nocturno ? 'papel' : 'nocturno');
      }}
      className={`font-space border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
        nocturno
          ? 'border-oscuro-borde text-oscuro-secundario hover:text-oscuro-texto'
          : 'border-tinta text-tinta hover:bg-papel-presionado'
      }`}
    >
      {nocturno ? 'Ver en papel' : 'Ver de noche'}
    </button>
  );
}

export default LaRadiografia;
