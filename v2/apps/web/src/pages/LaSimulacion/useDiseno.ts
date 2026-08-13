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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // `replaceState` y no `pushState`: mover un dial no es navegar, y llenar el
    // historial con cien pasos intermedios rompe el botón «atrás» del navegador.
    window.history.replaceState(null, '', escribirDisenoEnHash(diseno));
  }, [diseno]);

  const alternarBarrida = useCallback((clave: ClaveVariable) => {
    setDiseno((previo) => ({
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
    setDiseno((previo) => ({ ...previo, base: conVariable(previo.base, clave, valor) }));
  }, []);

  const cambiarMetodo = useCallback((metodo: Metodo) => {
    setDiseno((previo) => ({ ...previo, metodo }));
  }, []);

  const cambiarObjetivo = useCallback((objetivo: Objetivo) => {
    setDiseno((previo) => ({ ...previo, objetivo }));
  }, []);

  const cambiarSemilla = useCallback((semilla: number) => {
    setDiseno((previo) => ({ ...previo, base: { ...previo.base, semilla: Math.trunc(semilla) } }));
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
    setDiseno((previo) => ({
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
