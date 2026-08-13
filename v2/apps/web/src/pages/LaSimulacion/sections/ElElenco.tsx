import { numero, porcentaje } from '../simulacion-lectura';

import { SelloSintetico } from './SelloSintetico';


import type { ElencoCargado } from '../elenco-archivos';
import type { SesgoDeElenco } from '@v2/civic-core';

import { TablaPapel, type ColumnaPapel } from '~/components/papel/primitives';

/**
 * § El elenco — la primera pantalla del modo gente, antes de cualquier resultado.
 *
 * ## Por qué acá no hay un botón que llame a Ollama
 *
 * Por la ADR 0008 la API corre como función serverless: **no hay dónde meter un
 * modelo en producción**. Y por la ADR 0009 el texto no sale a ningún
 * proveedor. Las dos juntas no son una limitación disimulada, son el diseño: el
 * modo gente es una **herramienta local, de quien la corre en su máquina**. Un
 * botón «generar población» en una página pública prometería algo que en el
 * sitio desplegado no va a funcionar nunca; en vez de eso, la pantalla dice qué
 * hay que hacer y con qué comando.
 *
 * Encima, hacerlo desde el navegador está bloqueado por dos directivas de
 * nuestra propia CSP —`connect-src` no incluye 127.0.0.1 y
 * `upgrade-insecure-requests` reescribiría el `http://` a `https://`, donde
 * Ollama no sirve TLS— y por el chequeo de origen del propio Ollama. Ensanchar
 * todo eso para que una página pública hable con un demonio local sería pagar
 * un permiso grande por una función que no debería existir.
 *
 * ## Y por qué el sesgo va primero
 *
 * Regla 5: participación no equivale a representatividad, y toda síntesis
 * muestra cobertura y sesgo. En una población generada eso pesa el doble,
 * porque **el corpus con que se la sembró es una sola voz, la del proyecto**.
 * El sesgo es la primera pantalla del modo gente y no una nota debajo de un
 * mapa.
 */

export interface ElElencoProps {
  readonly elenco: ElencoCargado | null;
  readonly error: string | null;
  readonly onElegirArchivos: (archivos: readonly File[]) => void;
  readonly onAbrirPersona: (id: number) => void;
}

const COMANDOS: readonly { comando: string; explica: string }[] = [
  {
    comando: 'brew install ollama && ollama serve',
    explica: 'El demonio local. Nada de lo que escribas sale de tu máquina.',
  },
  {
    comando: 'ollama pull llama3.1:8b-instruct-q4_K_M',
    explica: 'Un 8B cuantizado entra en 18 GB de RAM con lugar de sobra.',
  },
  {
    comando: 'pnpm simulacion:calibrar --personas=1000',
    explica:
      'Mide tok/s de verdad en tu máquina antes de que gastes la tarde, y pide confirmación. Sin Ollama no rompe: imprime esto mismo y sale bien.',
  },
  {
    comando: 'pnpm simulacion:elenco --cuantas=200 --semilla=7',
    explica:
      'Escribe el elenco en `content/elencos/<huella>/`. Con `--escritor=fabricado` corre sin modelo y es determinista.',
  },
];

export function ElElenco({ elenco, error, onElegirArchivos, onAbrirPersona }: ElElencoProps) {
  if (elenco === null) {
    return (
      <section aria-labelledby="titulo-elenco" className="mt-8">
        <h2 id="titulo-elenco" className="font-anton text-tinta text-[28px] leading-[1.1]">
          Esto corre en tu máquina
        </h2>
        <p className="text-tinta-75 mb-6 mt-2 max-w-[70ch] text-[16px] leading-[1.55]">
          El modo gente necesita una población escrita por un modelo local. No hay un botón acá que
          la genere, y no es un olvido: el sitio publicado corre como función sin proceso largo, así
          que no hay dónde poner un modelo — y el texto del proyecto no sale a ningún proveedor
          externo. Generá el elenco con estos comandos y después cargalo desde el disco.
        </p>

        <ol className="border-tinta mb-6 border-t-2">
          {COMANDOS.map(({ comando, explica }) => (
            <li key={comando} className="border-papel-borde border-b py-3">
              <code className="font-space text-tinta bg-papel-presionado inline-block px-2 py-1 text-[13px]">
                {comando}
              </code>
              <p className="text-tinta-50 mt-1 max-w-[70ch] text-[13px] leading-[1.5]">{explica}</p>
            </li>
          ))}
        </ol>

        <label
          htmlFor="elenco-archivos"
          className="font-space text-tinta-50 mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]"
        >
          Cargar un elenco ya generado
        </label>
        <input
          id="elenco-archivos"
          type="file"
          multiple
          accept="application/json,.json"
          onChange={(e) => {
            onElegirArchivos(Array.from(e.target.files ?? []));
          }}
          className="text-tinta text-[14px]"
        />
        <p className="text-tinta-50 mt-2 max-w-[70ch] text-[13px] leading-[1.5]">
          Elegí los archivos de la carpeta del elenco: `manifiesto.json`, `conducta.json` y los
          `semblanzas-NNN.json`. No se sube a ningún lado: se leen acá y la dinámica corre en un
          worker de tu navegador.
        </p>

        {error === null ? null : (
          <p role="alert" className="text-sello mt-4 max-w-[70ch] text-[14px] leading-[1.5]">
            {error}
          </p>
        )}
      </section>
    );
  }

  const { manifiesto } = elenco;

  return (
    <section aria-labelledby="titulo-elenco" className="mt-8">
      <h2 id="titulo-elenco" className="sr-only">
        El elenco cargado
      </h2>

      <SelloSintetico
        sello={manifiesto.sello}
        huella={manifiesto.huella}
        personas={manifiesto.personas}
        advertencia={manifiesto.sesgo.advertencia}
      />

      <SesgoDelElenco sesgo={manifiesto.sesgo} />

      <h3 className="font-space text-tinta-50 mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.14em]">
        Quiénes son
      </h3>
      <div className="flex flex-wrap gap-2">
        {elenco.personas.slice(0, 24).map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => {
              onAbrirPersona(persona.id);
            }}
            className="font-space border-tinta text-tinta hover:bg-papel-presionado border px-3 py-1.5 text-[12px]"
          >
            #{persona.id} · {persona.territorio.territorioId}
          </button>
        ))}
      </div>
      <p className="text-tinta-50 mt-2 max-w-[70ch] text-[13px] leading-[1.5]">
        Las primeras veinticuatro de {manifiesto.personas.toLocaleString('es-AR')}. Podés editar el
        elenco antes de barrer: si no se puede editar, el modelo lo determinó y no lo sugirió.
      </p>
    </section>
  );
}

type FilaDeSesgo = SesgoDeElenco['porTerritorio'][number];

const COLUMNAS: readonly ColumnaPapel<FilaDeSesgo>[] = [
  { clave: 'territorio', rotulo: 'Provincia', celda: (f) => f.territorioId },
  { clave: 'personas', rotulo: 'Personas', alinear: 'der', celda: (f) => f.personas },
  {
    clave: 'elenco',
    rotulo: 'Del elenco',
    alinear: 'der',
    celda: (f) => porcentaje(f.fraccionElenco),
  },
  { clave: 'pais', rotulo: 'Del país', alinear: 'der', celda: (f) => porcentaje(f.fraccionPais) },
  {
    clave: 'desvio',
    rotulo: 'Desvío',
    alinear: 'der',
    celda: (f) => (
      <span className={Math.abs(f.desvio) > 0.02 ? 'text-sello' : 'text-tinta'}>
        {f.desvio > 0 ? '+' : ''}
        {numero(f.desvio * 100, 1)} pts
      </span>
    ),
  },
];

function SesgoDelElenco({ sesgo }: { sesgo: SesgoDeElenco }) {
  const peores = [...sesgo.porTerritorio]
    .sort((a, b) => Math.abs(b.desvio) - Math.abs(a.desvio))
    .slice(0, 8);

  return (
    <div>
      <h3 className="font-anton text-tinta text-[24px] leading-[1.15]">
        Dónde esta población no se parece al país
      </h3>
      <p className="text-tinta-75 mb-4 mt-1 max-w-[70ch] text-[14px] leading-[1.5]">
        Las ocho provincias donde el elenco más se aparta de cómo se reparte la población real. Esto
        va antes que cualquier resultado a propósito: una corrida sobre una población sesgada
        produce números correctos sobre un país que no existe.
      </p>
      <TablaPapel
        caption="Sesgo territorial del elenco contra el reparto real de la población."
        columnas={COLUMNAS}
        filas={peores}
        claveDeFila={(f) => f.territorioId}
        vacio="El elenco no declara reparto territorial."
      />
      {sesgo.territoriosSinPersona.length > 0 ? (
        <p className="text-tinta-75 mt-3 max-w-[70ch] text-[14px] leading-[1.5]">
          <strong>Sin una sola persona:</strong> {sesgo.territoriosSinPersona.join(', ')}. No es lo
          mismo «acá no habló nadie» que «acá no hay nadie que pueda hablar»: lo segundo es una
          propiedad del instrumento, no del país.
        </p>
      ) : null}
    </div>
  );
}
