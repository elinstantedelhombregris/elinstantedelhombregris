import { entero, numero, porcentaje } from '../simulacion-lectura';

import { CifraPapel } from './CifraPapel';

import type { Corrida, Forma } from '@v2/civic-core';

/**
 * § La ficha de una corrida — los cinco escalares, con su procedencia.
 *
 * Tres cosas que esta ficha muestra y que un panel de resultados no suele
 * mostrar:
 *
 * 1. **Pedido y logrado, juntos.** En modo forma coinciden por construcción, y
 *    eso **no se esconde: se dice**. Es la limitación principal de ese modo, y
 *    decirla en pantalla es lo que impide que alguien lea «la forma que pedí es
 *    la que salió» como una confirmación de algo.
 * 2. **Cobertura y sesgo, obligatorios** (regla 5). Participación no equivale a
 *    representatividad: un país donde habló una sola provincia puede tener
 *    legitimidad alta y no representar a nadie.
 * 3. **Reproducible o no**, computado y no declarado a mano. Una corrida que no
 *    se puede volver a producir no sirve para comparar con la de mañana.
 */

export interface FichaDeCorridaProps {
  readonly corrida: Corrida;
}

/** Los tres escalares de la forma. `composicion` es un objeto y va aparte. */
type CampoEscalar = Exclude<keyof Forma, 'composicion'>;

const CAMPOS: readonly { clave: CampoEscalar; rotulo: string; formato: (v: number) => string }[] = [
  { clave: 'participacion', rotulo: 'Participación', formato: (v) => numero(v, 1) },
  { clave: 'dispersion', rotulo: 'Dispersión', formato: (v) => numero(v, 3) },
  { clave: 'constancia', rotulo: 'Constancia', formato: (v) => numero(v, 3) },
];

export function FichaDeCorrida({ corrida }: FichaDeCorridaProps) {
  const { resumen, cobertura } = corrida;

  return (
    <section aria-labelledby="titulo-ficha" className="mt-10">
      <h2 id="titulo-ficha" className="font-anton text-tinta text-[24px] leading-[1.15]">
        La corrida, en cinco números
      </h2>
      <p className="font-space text-tinta-50 mb-4 mt-1 text-[11px] uppercase tracking-[0.1em]">
        {corrida.modo === 'forma' ? 'modo forma' : 'modo gente'} · semilla {corrida.semilla} ·{' '}
        {corrida.reproducible ? 'reproducible' : 'NO reproducible'} · cosecha {corrida.cosechaHuella}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CifraPapel etiqueta="Alcance" magnitud={resumen.alcance} formato={porcentaje} />
        <CifraPapel etiqueta="Persistencia" magnitud={resumen.persistencia} formato={porcentaje} />
        <CifraPapel etiqueta="Legitimidad" magnitud={resumen.legitimidad} formato={porcentaje} />
        <CifraPapel etiqueta="Cobertura" magnitud={resumen.cobertura} formato={porcentaje} />
        <CifraPapel
          etiqueta="Territorios con mandato"
          magnitud={resumen.territoriosConMandato}
          formato={entero}
        />
        <CifraPapel
          etiqueta="Población cubierta"
          magnitud={cobertura.poblacionCubierta}
          formato={porcentaje}
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            Lo que se pidió y lo que salió
          </h3>
          <dl className="text-[14px]">
            {CAMPOS.map(({ clave, rotulo, formato }) => (
              <div key={clave} className="border-papel-borde flex justify-between border-b py-1.5">
                <dt className="text-tinta-75">{rotulo}</dt>
                <dd className="font-space text-tinta tabular-nums">
                  {formato(corrida.pedido[clave])} → {formato(corrida.logrado[clave])}
                </dd>
              </div>
            ))}
          </dl>
          {corrida.modo === 'forma' ? (
            <p className="text-tinta-50 mt-2 max-w-[54ch] text-[13px] leading-[1.5]">
              En modo forma coinciden por construcción: el motor construye exactamente la forma que
              declaraste. Es la limitación principal de este modo, y por eso está dicha acá y no en
              un pie.
            </p>
          ) : (
            <p className="text-tinta-50 mt-2 max-w-[54ch] text-[13px] leading-[1.5]">
              En modo gente la forma es <strong>salida</strong>: lo pedido es lo que se declaró en la
              mesa y lo logrado es lo que efectivamente hizo la población. La diferencia entre las
              dos columnas es el desacuerdo entre los dos modos, y se puede medir.
            </p>
          )}
        </div>

        <div>
          <h3 className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            Cobertura y sesgo
          </h3>
          <p className="text-tinta text-[15px] leading-[1.5]">
            Habló en {entero(cobertura.territoriosConVoz.valor)} de{' '}
            {entero(cobertura.territoriosConDato.valor)} territorios con población conocida.
          </p>
          {cobertura.sesgo.tipo === 'valor' ? (
            <p className="text-tinta-75 mt-2 max-w-[54ch] text-[14px] leading-[1.5]">
              Sesgo territorial <strong>{numero(cobertura.sesgo.distancia.valor, 3)}</strong> —{' '}
              {cobertura.sesgo.formula}
            </p>
          ) : (
            <p className="text-tinta-50 mt-2 max-w-[54ch] text-[14px] leading-[1.5]">
              {cobertura.sesgo.razon}
            </p>
          )}
          <p className="text-tinta-50 mt-2 max-w-[54ch] text-[13px] leading-[1.5]">
            Participación no equivale a representatividad. Un país donde habló una sola provincia
            puede dar una legitimidad alta y no representar a nadie.
          </p>
        </div>
      </div>
    </section>
  );
}
