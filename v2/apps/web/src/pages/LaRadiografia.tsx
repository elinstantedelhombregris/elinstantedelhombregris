import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';

import { guardarTema, leerTema, type Orden, type Tema } from './LaRadiografia/radiografia-data';
import { construirVista } from './LaRadiografia/radiografia-vista';
import { CabeceraProcedencia } from './LaRadiografia/sections/CabeceraProcedencia';
import { CieloVacio } from './LaRadiografia/sections/CieloVacio';
import { ComoLeerElCielo } from './LaRadiografia/sections/ComoLeerElCielo';
import { Constelacion } from './LaRadiografia/sections/Constelacion';
import { DeslizadorUmbral } from './LaRadiografia/sections/DeslizadorUmbral';
import { FichaDeNucleo } from './LaRadiografia/sections/FichaDeNucleo';
import { InterruptorDeTema } from './LaRadiografia/sections/InterruptorDeTema';
import { ListaDeNucleos } from './LaRadiografia/sections/ListaDeNucleos';
import { RegimenDegenerado } from './LaRadiografia/sections/RegimenDegenerado';

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
 *
 * **Acá no se monta el ejemplo.** Los tres escenarios inventados viven en
 * `/la-radiografia/ejemplo`, con su propia ruta, su propio título y su propio
 * sello adentro del lienzo — enmienda `2026-08-16-enmienda-v1-los-ejemplos.md`
 * §3 y E5: el modo es excluyente, o mirás el ejemplo o mirás el país. Mezclar
 * las dos cosas en un mismo scroll es fabricar la captura que la enmienda §4
 * existe para prevenir. Desde acá va un link, y nada más que un link.
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
            <Kicker className="anim-fadeup mb-4">Sobre qué habla el país</Kicker>
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
              El mapa dice dónde se habló y cuándo. Esto dice{' '}
              <strong className="font-semibold">sobre qué</strong> — y qué se dijo casi igual en dos
              puntas del país sin que nadie se pusiera de acuerdo.
            </p>
            {/* Las dos advertencias epistemológicas, separadas de la tesis: la
                bajada vieja metía cuatro ideas en un párrafo y la revisión del
                19/8 lo midió como el primero de tres muros de texto antes de
                la imagen. No se pierde nada: se respira. */}
            <p
              className={`anim-fadeup mt-3 max-w-[640px] text-pretty text-[15px] leading-[1.55] ${
                nocturno ? 'text-oscuro-meta' : 'text-tinta-50'
              }`}
              style={{ animationDelay: '1.1s' }}
            >
              Dos cosas antes de mirar. Converger no es corroborar: que muchas señales digan lo
              mismo es evidencia de eso y de nada más — y ya es mucho. Y son{' '}
              <strong className="font-semibold">señales</strong>, no personas: acá se cuentan filas,
              y una sola persona puede haber cargado veinte.
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
            {/* Antes de la imagen y no después: si con este corpus los núcleos
                son aritmética del método, el lector tiene que saberlo antes de
                sacar la conclusión, no en un pie. Se dibuja solo cuando el
                servidor lo declara, y desaparece solo cuando deja de valer. */}
            <RegimenDegenerado regimen={data?.regimenDegenerado ?? null} tema={tema} />

            {/* La leyenda antes de la imagen: qué es un punto, qué es un
                núcleo, qué dice cada color y qué se puede tocar. Sin esto, la
                única leyenda vivía adentro de la ficha — que sólo aparece
                después de clickear lo que la leyenda explica. */}
            <ComoLeerElCielo tema={tema} />

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
                  // El corpus vivo. Un cielo `corpus` NO se sella: sellarlo
                  // sería afirmar que lo que dijo la gente es inventado.
                  origen="corpus"
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

        {/* Fuera del condicional a propósito: con la base casi vacía —`D-002`—
            el cielo de arriba puede estar vacío, y entonces este link es lo
            único que queda para entender qué hace el instrumento y qué no. Es
            un link y no una sección: el ejemplo no se monta acá (E5). */}
        <nav
          aria-label="El ejemplo de La Radiografía"
          className={`mt-16 border-t-2 pt-8 ${nocturno ? 'border-oscuro-borde' : 'border-tinta'}`}
        >
          <Kicker className="mb-3">Todavía no se ve nada, o se ve poco</Kicker>
          <Link
            href="/la-radiografia/ejemplo"
            className={`font-anton block max-w-[70ch] text-[clamp(24px,2.8vw,34px)] leading-[1.08] underline decoration-1 underline-offset-[6px] hover:opacity-70 ${
              nocturno ? 'text-oscuro-texto' : 'text-tinta'
            }`}
          >
            Ver un ejemplo, con voces inventadas →
          </Link>
          <p
            className={`mt-3 max-w-[70ch] text-[15px] leading-[1.55] ${
              nocturno ? 'text-oscuro-meta' : 'text-tinta-50'
            }`}
          >
            Tres corpus escritos a mano para mostrar qué hace este instrumento y qué no hace. Vive
            en otra pantalla a propósito: <strong className="font-semibold">nadie dijo</strong>{' '}
            ninguna de esas frases, y no se mezclan jamás con lo que dijo la gente.
          </p>
        </nav>
      </div>
    </main>
  );
}

export default LaRadiografia;
