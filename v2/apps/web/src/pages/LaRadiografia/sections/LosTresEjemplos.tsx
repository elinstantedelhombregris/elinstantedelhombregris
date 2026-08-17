import { useCallback, useMemo, useState } from 'react';

import {
  cifrasDeCorroboracion,
  cifrasDeLegitimidad,
  coberturaDe,
  COBERTURA_Y_SESGO,
  LOS_TRES_ESCENARIOS,
  SELLO_DEL_EJEMPLO,
  UMBRAL_DEL_EJEMPLO,
} from '../ejemplos';
import { digestoDeCorpus } from '../ejemplos/artefacto';
import { ARTEFACTO_DE_VECTORES } from '../ejemplos/vectores';
import {
  cortarEscenario,
  medirEscenario,
  medirLaEscalera,
  PASO_DEL_UMBRAL,
  UMBRAL_MAXIMO,
  UMBRAL_MINIMO,
} from '../ejemplos-vista';

import { BolsaDePalabras } from './BolsaDePalabras';
import { CoberturaDelEjemplo } from './CoberturaDelEjemplo';
import { Constelacion } from './Constelacion';
import { DeQueCuelgaLaLeccion } from './DeQueCuelgaLaLeccion';
import { DeslizadorUmbral } from './DeslizadorUmbral';
import { FichaDeNucleo } from './FichaDeNucleo';
import { ListaDeNucleos } from './ListaDeNucleos';
import { MandatoDelEjemplo } from './MandatoDelEjemplo';
import { TablaDeLosTres } from './TablaDeLosTres';

import type { ColumnaDeLosTres } from './TablaDeLosTres';
import type { Orden, Tema } from '../radiografia-data';

import { Kicker } from '~/components/papel/primitives';
import { SelloSintetico } from '~/pages/LaSimulacion/sections/SelloSintetico';

/**
 * § Los tres ejemplos — el mismo padrón, tres calidades de texto.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §12 y
 * `docs/specs/2026-08-01-el-mapa-simulacion.md` §5.4.
 *
 * Los tres escenarios tienen **el mismo número de voces y la misma
 * legitimidad**. Lo único que cambia es la calidad de lo que la gente escribió,
 * y así la diferencia entre ellos no se le puede atribuir al volumen: la lección
 * queda aislada donde tiene que estar.
 *
 * Las tres reglas que esta sección no puede romper, y dónde se cumple cada una:
 *
 *  1. **Converger no es corroborar.** El escenario 1 converge más que ninguno y
 *     no corrobora nada: la constelación de arriba lo muestra y la tabla lo
 *     cuenta, en la misma pantalla.
 *  2. **Toda síntesis muestra cobertura y sesgo** — `CoberturaDelEjemplo`, con
 *     la provincia muda por nombre, no en un pie.
 *  3. **La frase de un núcleo es una frase real de alguien**, nunca generada. La
 *     elige `fraseDelNucleo` entre las del corpus, y el sello dice con todas las
 *     letras que **nadie dijo ninguna de estas cosas**.
 *
 * El `SelloSintetico` se **reusa** de la Simulación, no se reescribe: la frase
 * del centro es la misma de siempre y es la afirmación más importante de la
 * pantalla, no un aviso legal.
 */

export interface LosTresEjemplosProps {
  readonly tema: Tema;
}

/** Un umbral como se escribe en castellano: `0,40` y no `0.4`. */
const legible = (n: number): string => n.toFixed(2).replace('.', ',');

export function LosTresEjemplos({ tema }: LosTresEjemplosProps) {
  const [activo, setActivo] = useState<string>(LOS_TRES_ESCENARIOS[0]?.id ?? 'bronca');
  const [umbral, setUmbral] = useState(UMBRAL_DEL_EJEMPLO);
  const [enfocado, setEnfocado] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>('tamano');

  // La medición no depende del umbral —el grafo k-NN es el mismo, el umbral lo
  // corta— así que corre una sola vez para los tres escenarios y no en cada
  // milímetro del deslizador.
  const medidas = useMemo(
    () => LOS_TRES_ESCENARIOS.map((e) => medirEscenario(e, ARTEFACTO_DE_VECTORES)),
    [],
  );
  const cortes = useMemo(() => medidas.map((m) => cortarEscenario(m, umbral)), [medidas, umbral]);

  // El barrido del mando entero: 41 cortes por escenario. No depende del
  // umbral —mide qué pasa en TODOS— así que corre una sola vez, y cuesta menos
  // que un cuadro de la constelación.
  const escalera = useMemo(() => medirLaEscalera(medidas), [medidas]);

  const columnas: ColumnaDeLosTres[] = useMemo(
    () =>
      medidas.map((medida, i) => ({
        escenario: medida.escenario,
        legitimidad: cifrasDeLegitimidad(medida.escenario),
        corroboracion: cifrasDeCorroboracion(medida.escenario),
        cobertura: coberturaDe(medida.escenario),
        medida,
        corte: cortes[i] ?? cortarEscenario(medida, umbral),
      })),
    [medidas, cortes, umbral],
  );

  const enfocar = useCallback((id: string | null) => {
    setEnfocado(id);
  }, []);

  const columna = columnas.find((c) => c.escenario.id === activo) ?? columnas[0];
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';

  if (!columna) return null;

  // Un núcleo enfocado que ya no existe —porque cambió el escenario o el
  // umbral— apagaría el cielo entero sin que nada quede encendido. Se descarta
  // acá en vez de guardarse un efecto que lo limpie: el estado no miente, se lo
  // lee contra lo que hay.
  const abierto = columna.corte.nucleos.find((n) => n.id === enfocado) ?? null;
  const artefactoAlDia = digestoDeCorpus(LOS_TRES_ESCENARIOS) === ARTEFACTO_DE_VECTORES.digesto;
  const faltantes = medidas.reduce((total, m) => total + m.faltantes.length, 0);
  const enElUmbralDelEjemplo = Math.abs(umbral - UMBRAL_DEL_EJEMPLO) < PASO_DEL_UMBRAL / 2;

  return (
    <section aria-labelledby="los-tres-ejemplos" className={`border-t-2 ${borde} pt-10`}>
      <Kicker className="mb-4">Tres ejemplos, un solo padrón</Kicker>
      <h2
        id="los-tres-ejemplos"
        className={`font-anton mb-5 text-[clamp(32px,4vw,52px)] leading-[1.02] ${texto}`}
      >
        Las mismas voces, escritas de tres maneras.
      </h2>
      <p className={`mb-8 max-w-[70ch] text-pretty text-[18px] leading-[1.6] ${texto}`}>
        Las mismas 63 señales, las mismas 44 personas, los mismos 8 territorios, los mismos 12
        meses. Lo único que cambia entre los tres es{' '}
        <strong className="font-semibold">qué escribieron</strong>. Por eso la legitimidad no se
        puede mover: sale de alcance × persistencia, y el motor que la calcula no lee el texto. Lo
        que sí cambia, entero, es qué se puede hacer con lo que se dijo.
      </p>

      <SelloSintetico
        sello={SELLO_DEL_EJEMPLO.sello}
        huella={SELLO_DEL_EJEMPLO.huella}
        personas={SELLO_DEL_EJEMPLO.personas}
        advertencia={SELLO_DEL_EJEMPLO.advertencia}
      />

      {/* Antes de la imagen y con peso: de qué está hecha la convergencia que
          se va a ver. Es procedencia, igual que el corte y el modelo — no un
          descargo, y por eso no va al pie. */}
      <BolsaDePalabras artefacto={ARTEFACTO_DE_VECTORES} tema={tema} />

      {artefactoAlDia && faltantes === 0 ? null : (
        <p className={`border-violeta mb-6 border-l-2 pl-4 text-[15px] leading-[1.55] ${texto}`}>
          Los vectores commiteados no corresponden a este corpus
          {faltantes > 0 ? ` (faltan ${String(faltantes)} voces)` : ''}. Lo que se dibuja abajo
          puede no ser lo que dicen estas frases: hay que correr{' '}
          <code>pnpm radiografia:ejemplos</code>.
        </p>
      )}

      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Elegí el escenario"
      >
        {columnas.map(({ escenario }, i) => (
          <button
            key={escenario.id}
            type="button"
            aria-pressed={escenario.id === activo}
            onClick={() => {
              setActivo(escenario.id);
              setEnfocado(null);
            }}
            className={`font-space border px-4 py-3 text-left text-[12px] font-bold uppercase tracking-[0.08em] transition-colors ${
              escenario.id === activo
                ? 'bg-violeta border-violeta text-papel'
                : nocturno
                  ? 'border-oscuro-borde text-oscuro-secundario hover:text-oscuro-texto'
                  : 'border-tinta text-tinta hover:bg-papel-presionado'
            }`}
          >
            {i + 1} · {escenario.titulo}
          </button>
        ))}
      </div>

      <p className={`mb-2 max-w-[70ch] text-[17px] leading-[1.55] ${texto}`}>
        {columna.escenario.resumen}
      </p>
      {/* `loQueSeVe` describe la constelación AL UMBRAL CON EL QUE SE ESCRIBIÓ
          el ejemplo, y el deslizador de abajo lo mueve. Dejar la prosa sin
          fecharla la volvería falsa en cuanto alguien arrastre un milímetro:
          diría «ocho núcleos» arriba de una constelación de cuatro. Se la
          rotula, y los números vivos los dan el deslizador y la tabla. */}
      <p className={`mb-6 max-w-[70ch] text-[14px] leading-[1.55] ${meta}`}>
        {enElUmbralDelEjemplo ? null : (
          <strong className={`font-semibold ${texto}`}>
            A {legible(UMBRAL_DEL_EJEMPLO)}, donde arranca el ejemplo:{' '}
          </strong>
        )}
        {columna.escenario.loQueSeVe}
      </p>

      {/* φ y sólo acá: 1,618fr de constelación a 1fr de ficha (§5.6.5). */}
      <div className="grid gap-0 lg:grid-cols-[1.618fr_1fr]">
        <div className="h-[460px] w-full">
          <Constelacion
            nucleos={columna.corte.nucleos}
            solas={columna.corte.solas}
            aristas={columna.corte.aristas}
            tema={tema}
            enfocado={abierto ? abierto.id : null}
            onEnfocar={enfocar}
            // Lo que hace que el lienzo se selle por dentro. No es un
            // interruptor: es de qué corpus es este cielo (enmienda §4.1).
            origen="ejemplo"
            testId="constelacion-del-ejemplo"
          />
        </div>
        <FichaDeNucleo
          nucleo={abierto}
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
          origen="exacto"
          nucleos={columna.corte.nucleos.length}
          solas={columna.corte.solas.length}
          tema={tema}
          min={UMBRAL_MINIMO}
          max={UMBRAL_MAXIMO}
          etiqueta="Qué tan parecido es «lo mismo», en el ejemplo"
          nota={`Arranca en ${UMBRAL_DEL_EJEMPLO.toFixed(2).replace('.', ',')} y se mueve entre ${UMBRAL_MINIMO.toFixed(2).replace('.', ',')} y ${UMBRAL_MAXIMO.toFixed(2).replace('.', ',')}, de a ${PASO_DEL_UMBRAL.toFixed(2).replace('.', ',')}. No es el 0,72 de arriba y no puede serlo: estos vectores los hizo el embebedor «${ARTEFACTO_DE_VECTORES.modelo}», una bolsa de palabras sin modelo, y sus cosenos viven más abajo. El día que haya un embebedor de verdad se regenera el artefacto y este número se recalibra midiendo, no heredando.`}
        />
      </div>

      {/* El camino accesible al MISMO estado (R11). El lienzo es `aria-hidden`,
          así que sin esta tabla el ejemplo no existe para quien navega con
          teclado o con lector de pantalla — y es acá donde la lección se toca:
          la frase del núcleo grande de la bronca no tiene dónde ni cuándo, y
          las del dato traen calle y fecha. */}
      <ListaDeNucleos
        nucleos={columna.corte.nucleos}
        orden={orden}
        onOrdenar={setOrden}
        enfocado={abierto ? abierto.id : null}
        onEnfocar={enfocar}
        tema={tema}
      />

      {/* De qué cuelga la lección — y de qué no. Va ANTES de la tabla porque
          la tabla imprime las tres lecturas y el lector tiene que saber cuál
          de ellas sostiene la conclusión antes de leerlas. */}
      <DeQueCuelgaLaLeccion escalera={escalera} tema={tema} />

      <TablaDeLosTres columnas={columnas} umbral={umbral} activo={activo} tema={tema} />

      <MandatoDelEjemplo escenario={columna.escenario} tema={tema} />

      <CoberturaDelEjemplo
        cobertura={columna.cobertura}
        advertencias={COBERTURA_Y_SESGO}
        tema={tema}
      />
    </section>
  );
}
