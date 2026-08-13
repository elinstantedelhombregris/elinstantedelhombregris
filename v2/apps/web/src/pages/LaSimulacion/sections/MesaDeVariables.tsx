import {
  CLASE_DE_VARIABLE,
  CLAVES_VARIABLE,
  conectadaEn,
  leerVariable,
  razonDeNoConectada,
} from '@v2/civic-core';

import { NOMBRE_DE_CLASE_DE_VARIABLE } from '../simulacion-lectura';

import { Variable } from './Variable';

import type { EstadoDeVariable } from '../useDiseno';
import type { ClaseDeVariable, ClaveVariable, Diseno } from '@v2/civic-core';

/**
 * § La mesa de variables — las dieciocho, agrupadas por lo que son.
 *
 * Las siete palancas de la Simulación **no** son un grupo homogéneo, y forzarlas
 * a serlo es lo que rompería el módulo en seis meses. Agrupadas se lee de un
 * vistazo dónde los dos modos se corresponden y dónde no:
 *
 * - **la forma** la declara un modo y la produce el otro;
 * - **los ajustes** los obedecen los dos, en el mismo lugar del cálculo;
 * - **el mecanismo** existe sólo en el modo gente, porque el modo forma no tiene
 *   interacción y por lo tanto no tiene dónde ponerlo;
 * - **los coeficientes** son decisiones nuestras, no de la gente — y barrerlos
 *   es la media pregunta que un barrido de sólo palancas no hace: «¿cuánto de
 *   lo que veo depende de que el piso lo hayamos puesto en 100?».
 *
 * Se muestran las dieciocho, también las que este modo no lee, con la razón
 * escrita. Una ausencia sin explicación se lee como un olvido.
 */

const ORDEN: readonly ClaseDeVariable[] = ['forma', 'ajuste', 'coeficiente', 'mecanismo'];

const GLOSA: Readonly<Record<ClaseDeVariable, string>> = {
  forma: 'Qué forma tiene la voz del país. El modo forma la declara; el modo gente la produce.',
  ajuste: 'Los dos modos los obedecen, en el mismo lugar del cálculo.',
  coeficiente:
    'Decisiones nuestras, no de la gente. Están publicadas con su razón y se pueden barrer.',
  mecanismo: 'Cómo se mueve una población. Sólo existe en el modo gente.',
};

export interface MesaDeVariablesProps {
  readonly diseno: Diseno;
  readonly onAlternar: (clave: ClaveVariable) => void;
  readonly onFijar: (clave: ClaveVariable, valor: number) => void;
}

export function MesaDeVariables({ diseno, onAlternar, onFijar }: MesaDeVariablesProps) {
  const estadoDe = (clave: ClaveVariable): EstadoDeVariable => {
    if (!conectadaEn(clave, diseno.modo)) return 'noConectada';
    return diseno.claves.includes(clave) ? 'barrida' : 'fijada';
  };

  return (
    <section aria-labelledby="titulo-mesa">
      <h2
        id="titulo-mesa"
        className="font-space text-tinta-50 mb-1 text-[11px] font-bold uppercase tracking-[0.14em]"
      >
        La mesa de variables
      </h2>
      <p className="text-tinta-75 mb-6 max-w-[70ch] text-[15px] leading-[1.55]">
        Lo que se fija vale un número; lo que se barre lo recorre el motor sobre su dominio
        declarado. El rango no se edita acá a propósito: el motor toma el suyo, con su razón
        escrita, y un campo que él no leyera sería una perilla de adorno.
      </p>

      {ORDEN.map((clase) => {
        const claves = CLAVES_VARIABLE.filter((c) => CLASE_DE_VARIABLE[c] === clase);
        return (
          <div key={clase} className="mb-8">
            <h3 className="font-anton text-tinta text-[20px] leading-[1.2]">
              {NOMBRE_DE_CLASE_DE_VARIABLE[clase]}
            </h3>
            <p className="text-tinta-50 mb-2 max-w-[70ch] text-[13px] leading-[1.5]">
              {GLOSA[clase]}
            </p>
            <ul className="border-tinta border-t-2">
              {claves.map((clave) => (
                <Variable
                  key={clave}
                  clave={clave}
                  estado={estadoDe(clave)}
                  valor={leerVariable(diseno.base, clave)}
                  razon={razonDeNoConectada(clave, diseno.modo)}
                  onAlternar={onAlternar}
                  onFijar={onFijar}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
