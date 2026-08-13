import {
  conVariable,
  type ClaveVariable,
  type Diseno,
  type Metodo,
  type ModoDeCorrida,
  type Objetivo,
  type Pais,
} from '@v2/civic-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { escribirDisenoEnHash, leerDisenoDelHash } from './diseno-url';
import { disenoPorDefecto } from './simulacion-pais';


/**
 * El estado del diseño: qué se pregunta, qué se fija y qué se barre.
 *
 * Vive en un hook y no en la página por el límite de 300 LOC, pero sobre todo
 * porque lo que hay acá **no es estado de interfaz**: es el objeto citable que
 * viaja en la URL y que otra persona vuelve a correr. Que la página sólo lo
 * muestre y lo pase al worker mantiene esa distinción a la vista.
 *
 * Una decisión que conviene decir en voz alta: **el rango de una variable no se
 * edita acá**. `barrer()` toma los dominios de `DOMINIOS`, con su razón
 * escrita; ofrecer un campo para escribir otro mínimo y otro máximo produciría
 * dos controles de utilería —el motor no los leería— y sería exactamente la
 * lección de MiroFish, donde trece de dieciséis perillas se generan y no las
 * lee nadie. Lo que sí se elige es qué variables se barren, cuál se fija y en
 * cuánto, cuántos pasos y con qué método: todo eso el motor lo obedece.
 */

/** El estado declarado de una variable, que es lo que la mesa dibuja. */
export type EstadoDeVariable = 'fijada' | 'barrida' | 'noConectada';

export interface MesaDeDiseno {
  readonly diseno: Diseno;
  readonly avisos: readonly string[];
  readonly alternarBarrida: (clave: ClaveVariable) => void;
  readonly fijarVariable: (clave: ClaveVariable, valor: number) => void;
  readonly cambiarMetodo: (metodo: Metodo) => void;
  readonly cambiarObjetivo: (objetivo: Objetivo) => void;
  readonly cambiarSemilla: (semilla: number) => void;
  readonly cambiarModo: (modo: ModoDeCorrida, poblacionHuella: string | null) => void;
}

/** Los cuatro del mecanismo, cuando entra un elenco. Sólo el modo gente los lee. */
export const MECANISMO_INICIAL = { chispa: 0.15, contagio: 0.5, desaliento: 0.3, grado: 8 };

export function useDiseno(pais: Pais): MesaDeDiseno {
  const porDefecto = useMemo(() => disenoPorDefecto(pais), [pais]);

  /**
   * El hash se lee **una sola vez**, al montar. Releerlo en cada render haría
   * que escribir la URL y editar la mesa se pisaran, y el diseño terminaría
   * dependiendo de cuál de los dos ganó la carrera.
   */
  const inicial = useRef<{ diseno: Diseno; avisos: readonly string[] } | null>(null);
  inicial.current ??= leerDisenoDelHash(
    typeof window === 'undefined' ? '' : window.location.hash,
    porDefecto,
  );

  const [diseno, setDiseno] = useState<Diseno>(inicial.current.diseno);
  const avisos = inicial.current.avisos;

  /**
   * Si el hash de la URL se puede reescribir con lo de acá.
   *
   * Arranca en `true` —el caso normal: entrás sin hash, o con uno tuyo, y la
   * URL tiene que quedar siempre lista para copiar— y arranca en **`false`
   * cuando el link que llegó trajo un desajuste**, o sea cuando venía con hash
   * Y `leerDisenoDelHash` tuvo algo que avisar.
   *
   * La distinción existe porque sin ella el efecto pisaba el hash recibido en
   * el primer render con la huella y el reloj LOCALES. El aviso —«se armó
   * contra otro país»— seguía apareciendo en esa sesión, así que parecía
   * funcionar; lo que se perdía era la evidencia. Al recargar, el link ya decía
   * el país de acá y no avisaba nada. **Un desajuste que se lava solo en un
   * segundo es peor que uno que nunca se detectó, porque la próxima persona lo
   * hereda limpio y no tiene cómo saber que hubo uno.**
   *
   * Mover un dial lo convierte en tuyo: ahí la huella de acá pasa a ser la
   * verdad sobre lo que estás por correr, y la URL vuelve a escribirse sola.
   */
  const escribible = useRef(
    typeof window === 'undefined' ||
      window.location.hash.length <= 1 ||
      inicial.current.avisos.length === 0,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!escribible.current) return;
    // `replaceState` y no `pushState`: mover un dial no es navegar, y llenar el
    // historial con cien pasos intermedios rompe el botón «atrás» del navegador.
    //
    // El país entra acá porque lo que se escribe lleva su huella Y su reloj, y
    // las dos tienen que salir del mismo objeto: un hash con la huella de un
    // país y el reloj de otro es un link que abre un tercero.
    window.history.replaceState(null, '', escribirDisenoEnHash(diseno, pais));
  }, [diseno, pais]);

  /** Todo camino que edita el diseño pasa por acá, y lo vuelve tuyo. */
  const editar = useCallback((f: (previo: Diseno) => Diseno) => {
    escribible.current = true;
    setDiseno(f);
  }, []);

  const alternarBarrida = useCallback((clave: ClaveVariable) => {
    editar((previo) => ({
      ...previo,
      claves: previo.claves.includes(clave)
        ? previo.claves.filter((c) => c !== clave)
        : [...previo.claves, clave],
    }));
  }, []);

  const fijarVariable = useCallback((clave: ClaveVariable, valor: number) => {
    // Pasa por `conVariable`, que acota al dominio declarado y renormaliza la
    // composición: la mesa no puede escribir un escenario que el motor no
    // podría haber producido por su cuenta.
    editar((previo) => ({ ...previo, base: conVariable(previo.base, clave, valor) }));
  }, []);

  const cambiarMetodo = useCallback((metodo: Metodo) => {
    editar((previo) => ({ ...previo, metodo }));
  }, []);

  const cambiarObjetivo = useCallback((objetivo: Objetivo) => {
    editar((previo) => ({ ...previo, objetivo }));
  }, []);

  const cambiarSemilla = useCallback((semilla: number) => {
    editar((previo) => ({ ...previo, base: { ...previo.base, semilla: Math.trunc(semilla) } }));
  }, []);

  /**
   * Cambiar de modo cambia el escenario, no sólo la etiqueta.
   *
   * El modo gente necesita un `mecanismo` con la huella de SU elenco, y el modo
   * forma lo pone en `null` — «no tiene interacción, así que no hay dónde
   * ponerlo». Un mecanismo que sobreviviera al cambio de modo sería un objeto
   * que el modo forma no lee y que igual viajaría en la URL: la definición de
   * utilería.
   */
  const cambiarModo = useCallback((modo: ModoDeCorrida, poblacionHuella: string | null) => {
    editar((previo) => ({
      ...previo,
      modo,
      base: {
        ...previo.base,
        mecanismo:
          modo === 'gente' && poblacionHuella !== null
            ? { poblacionHuella, ...MECANISMO_INICIAL }
            : null,
      },
    }));
  }, []);

  return {
    diseno,
    avisos,
    alternarBarrida,
    fijarVariable,
    cambiarMetodo,
    cambiarObjetivo,
    cambiarSemilla,
    cambiarModo,
  };
}
