import { useCallback, useMemo, useState } from 'react';

import { leerRelojDelHash } from './LaSimulacion/diseno-url';
import { leerElencoDeArchivos, type ElencoCargado } from './LaSimulacion/elenco-archivos';
import { CabeceraDelDiseno } from './LaSimulacion/sections/CabeceraDelDiseno';
import { ControlesDeCorrida } from './LaSimulacion/sections/ControlesDeCorrida';
import { ElElenco } from './LaSimulacion/sections/ElElenco';
import { ElPaisCargado } from './LaSimulacion/sections/ElPaisCargado';
import { FichaDePersona } from './LaSimulacion/sections/FichaDePersona';
import { MesaDeVariables } from './LaSimulacion/sections/MesaDeVariables';
import { Resultados } from './LaSimulacion/sections/Resultados';
import { construirPais } from './LaSimulacion/simulacion-pais';
import { useBarrido } from './LaSimulacion/useBarrido';
import { useDiseno } from './LaSimulacion/useDiseno';

import type { ClaveVariable, ModoDeCorrida } from '@v2/civic-core';

import { Kicker, RitoTinta } from '~/components/papel/primitives';


/**
 * La Simulación — un módulo, dos modos, una espina.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md`.
 *
 * En el **modo forma** declarás la forma del país que hablaría y el motor la
 * construye; en el **modo gente** declarás quiénes son y la forma sale de lo que
 * hacen. Los dos producen la misma cosecha, así que el mandato, la procedencia,
 * la cobertura, el barrido y la comparación son **uno solo** — y por eso esto es
 * un módulo con dos modos y no dos programas que comparten carpeta.
 *
 * Tres cosas que esta página hace y un panel de perillas no:
 *
 * 1. **Tiene una pregunta**, y está arriba. Barrer una perilla sin pregunta no
 *    significa nada.
 * 2. **El cálculo no corre en el hilo de la pantalla.** Va a un worker, avisa
 *    cuántas corridas lleva y se puede cancelar de verdad.
 * 3. **Dice lo que no sabe.** Una variable que el motor no lee sale con su
 *    razón y no con una barra en cero; una banda sin muestras suficientes dice
 *    que no alcanzan; y nada de esto es un pronóstico.
 */

/**
 * El reloj del país: **el del link si el link lo trae**, y el de la máquina si no.
 *
 * Se congela una sola vez, al montar. Eso solo es el arreglo del §1.5 —con
 * `Date.now()` leído en cada cálculo un milisegundo alcanza para voltear el
 * mandato de un territorio cuando una voz cae cerca del borde de un período—,
 * pero congelarlo por carga no alcanza: `ahora` entra en `huellaDePais`, así
 * que **cada carga inventaba un país distinto**, el escenario del hash declaraba
 * el país de la carga anterior y `verificarPais` tiraba antes de la primera
 * corrida. Recargar mataba la herramienta, y compartir una configuración —que la
 * spec promete en su §8.7— era inalcanzable.
 *
 * Leerlo del hash es lo que ordena el resto: primero el reloj, después el país,
 * después el diseño contra ese país. Un link congela su país en el instante en
 * que se armó, que es justamente lo que se le pide a un diseño citable, y la
 * cabecera muestra la fecha de ese reloj en vez de esconderla.
 */
function relojDelPais(): number {
  if (typeof window === 'undefined') return Date.now();
  return leerRelojDelHash(window.location.hash) ?? Date.now();
}

export function LaSimulacion() {
  const [ahora] = useState(relojDelPais);
  const pais = useMemo(() => construirPais(ahora), [ahora]);

  const mesa = useDiseno(pais);
  const barrido = useBarrido();

  const [elenco, setElenco] = useState<ElencoCargado | null>(null);
  const [errorDeElenco, setErrorDeElenco] = useState<string | null>(null);
  const [elegida, setElegida] = useState<ClaveVariable | null>(null);
  const [personaAbierta, setPersonaAbierta] = useState<number | null>(null);

  const { diseno } = mesa;
  const enGente = diseno.modo === 'gente';
  const idsDeTerritorio = useMemo(() => pais.territorios.map((t) => t.id), [pais]);

  const cargarElenco = useCallback(
    (archivos: readonly File[]) => {
      if (archivos.length === 0) return;
      setErrorDeElenco(null);
      void leerElencoDeArchivos(archivos).then((lectura) => {
        if (!lectura.ok) {
          setErrorDeElenco(lectura.motivo);
          return;
        }
        setElenco(lectura.elenco);
        // El mecanismo se ata a ESTE elenco: sin su huella adentro, `barrer` se
        // niega a correr, que es exactamente lo que tiene que hacer.
        mesa.cambiarModo('gente', lectura.elenco.manifiesto.huella);
      });
    },
    [mesa],
  );

  const cambiarModo = useCallback(
    (modo: ModoDeCorrida) => {
      mesa.cambiarModo(modo, elenco?.manifiesto.huella ?? null);
    },
    [mesa, elenco],
  );

  const correr = useCallback(() => {
    barrido.correr(diseno, ahora, enGente ? (elenco?.transferible ?? null) : null);
  }, [barrido, diseno, ahora, enGente, elenco]);

  const persona =
    personaAbierta === null ? null : (elenco?.personas.find((p) => p.id === personaAbierta) ?? null);

  return (
    <main>
      <div className="mx-auto max-w-[1180px] px-10 py-[72px] max-[560px]:px-5">
        <Kicker className="anim-fadeup mb-4">El instrumento</Kicker>
        <h1
          aria-label="La Simulación."
          className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,84px)] leading-[0.98]"
        >
          <RitoTinta lineas={['La Simulación.']} />
        </h1>
        <p
          className="anim-fadeup text-tinta-75 mb-10 max-w-[70ch] text-pretty text-[18px] leading-[1.6]"
          style={{ animationDelay: '0.9s' }}
        >
          Dos modos del mismo instrumento. En uno declarás la forma del país que hablaría y el motor
          la construye; en el otro declarás quiénes son y la forma sale de lo que hacen. Los dos
          contestan la misma pregunta con los mismos números, y por eso se pueden comparar.
        </p>

        <CabeceraDelDiseno
          diseno={diseno}
          pais={pais}
          estado={barrido.estado}
          avisos={mesa.avisos}
        />

        <ControlesDeCorrida
          diseno={diseno}
          estado={barrido.estado}
          territorios={idsDeTerritorio}
          puedeModoGente={elenco !== null}
          onCambiarModo={cambiarModo}
          onCambiarMetodo={mesa.cambiarMetodo}
          onCambiarObjetivo={mesa.cambiarObjetivo}
          onCambiarSemilla={mesa.cambiarSemilla}
          onCorrer={correr}
          onCancelar={barrido.cancelar}
        />

        {/*
          Va SIEMPRE, y la razón es un candado que ya se cerró una vez.
          Esta sección vivía detrás de `enGente || elenco !== null`, pero el botón
          «Gente» está deshabilitado mientras no haya elenco (`puedeModoGente`), así
          que `enGente` no podía volverse verdadero sin un elenco y `elenco !== null`
          era falso por definición: las instrucciones para CONSEGUIR un elenco
          quedaban detrás de tener uno. En la página publicada los cuatro comandos y
          el cargador de archivos eran inalcanzables. El componente estaba bien —su
          test lo monta solo y pasa—; lo que fallaba era el cableado.

          Con `elenco === null` esto es el estado vacío que enseña a generarlo; con un
          elenco cargado es el sesgo de la población, que va antes que cualquier
          resultado (regla 5).
        */}
        <ElElenco
          elenco={elenco}
          error={errorDeElenco}
          onElegirArchivos={cargarElenco}
          onAbrirPersona={setPersonaAbierta}
        />
        <FichaDePersona
          persona={persona}
          onCerrar={() => {
            setPersonaAbierta(null);
          }}
        />

        <ElPaisCargado pais={pais} escenario={diseno.base} elenco={enGente ? elenco : null} />

        {barrido.estado.fase === 'listo' ? (
          <Resultados
            resultado={barrido.estado.resultado}
            base={barrido.estado.base}
            objetivo={diseno.objetivo}
            territorios={pais.territorios.length}
            elegida={elegida}
            onElegir={setElegida}
          />
        ) : null}

        <div className="mt-12">
          <MesaDeVariables
            diseno={diseno}
            onAlternar={mesa.alternarBarrida}
            onFijar={mesa.fijarVariable}
          />
        </div>

        <p className="border-tinta text-tinta-75 mt-12 max-w-[80ch] border-t-2 pt-5 text-[14px] leading-[1.55]">
          Esto no pronostica. Ni el modo forma ni el modo gente dicen qué va a pasar: dicen qué
          pasaría <em>si</em> valieran los supuestos declarados. Y no contesta qué pasaría si
          hablaran los que hoy no hablan y no se parecen a los que hablan — eso necesita una
          población con estructura, y aun así sólo vale bajo el sesgo de su corpus.
        </p>
      </div>
    </main>
  );
}

export default LaSimulacion;
