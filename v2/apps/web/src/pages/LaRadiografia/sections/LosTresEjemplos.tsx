import { useCallback, useMemo, useState } from 'react';

import {
  cifrasDeCorroboracion,
  cifrasDeLegitimidad,
  coberturaDe,
  COBERTURA_Y_SESGO,
  LOS_TRES_ESCENARIOS,
  resumenDelCorpus,
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
import { DeQueCuelgaLaLeccion } from './DeQueCuelgaLaLeccion';
import { DeslizadorUmbral } from './DeslizadorUmbral';
import { ExploradorConstelacion } from './ExploradorConstelacion';
import { ListaDeNucleos } from './ListaDeNucleos';
import { MandatoDelEjemplo } from './MandatoDelEjemplo';
import { TablaDeLosTres } from './TablaDeLosTres';

import type { ColumnaDeLosTres } from './TablaDeLosTres';
import type { Orden, Tema } from '../radiografia-data';

import { SelloSintetico } from '~/pages/LaSimulacion/sections/SelloSintetico';

export interface LosTresEjemplosProps {
  readonly tema: Tema;
}

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

  // Cuántas frases, personas, lugares y meses hay: se cuentan, no se escriben.
  const corpus = resumenDelCorpus(columna.escenario);

  // Un núcleo enfocado que ya no existe —porque cambió el escenario o el
  // umbral— apagaría el cielo entero sin que nada quede encendido. Se descarta
  // acá en vez de guardarse un efecto que lo limpie: el estado no miente, se lo
  // lee contra lo que hay.
  const abierto = columna.corte.nucleos.find((n) => n.id === enfocado) ?? null;
  const artefactoAlDia = digestoDeCorpus(LOS_TRES_ESCENARIOS) === ARTEFACTO_DE_VECTORES.digesto;
  const faltantes = medidas.reduce((total, m) => total + m.faltantes.length, 0);
  const enElUmbralDelEjemplo = Math.abs(umbral - UMBRAL_DEL_EJEMPLO) < PASO_DEL_UMBRAL / 2;

  return (
    <section aria-labelledby="los-tres-ejemplos">
      {/* Visible: era `sr-only`, y la frase que explica qué se hace acá no le
          llegaba a quien mira (revisión del 9/10). */}
      <h2
        id="los-tres-ejemplos"
        className={`font-anton mb-1 text-[clamp(22px,2.4vw,30px)] ${texto}`}
      >
        Elegí cómo están escritas las frases
      </h2>
      <p className={`mb-4 max-w-[70ch] text-[15px] leading-[1.5] ${meta}`}>
        Son {corpus.frases.toLocaleString('es-AR')} frases inventadas, escritas de{' '}
        {LOS_TRES_ESCENARIOS.length === 3 ? 'tres' : String(LOS_TRES_ESCENARIOS.length)} maneras.
        Cambiá el escenario y mirá cómo se agrupan.
      </p>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        {/* El sello rojo se hunde sobre el fondo de noche (3,07:1): ahí va el sello claro. */}
        <span
          className={`font-space border-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
            nocturno ? 'border-sello-claro text-sello-claro' : 'border-sello text-sello'
          }`}
        >
          Ejemplo · voces inventadas
        </span>
        <details className="max-w-[840px]">
          <summary className={`min-h-11 cursor-pointer py-2 text-sm underline ${meta}`}>
            De dónde salen las frases y cómo se armó el ejemplo
          </summary>
          <div className="py-4">
            <p className={`mb-5 text-sm leading-relaxed ${texto}`}>
              Las mismas {corpus.frases.toLocaleString('es-AR')} frases, las mismas{' '}
              {corpus.personas.toLocaleString('es-AR')} personas, los mismos{' '}
              {corpus.lugares.toLocaleString('es-AR')} lugares, los mismos{' '}
              {corpus.meses.toLocaleString('es-AR')} meses. Lo único que cambia entre los tres es
              qué escribieron. Por eso la legitimidad no se puede mover: sale de alcance ×
              persistencia, y el motor que la calcula no lee el texto.
            </p>
            <div className="bg-papel text-tinta p-4">
              <SelloSintetico
                sello={SELLO_DEL_EJEMPLO.sello}
                sinModelo={SELLO_DEL_EJEMPLO.sinModelo}
                huella={SELLO_DEL_EJEMPLO.huella}
                personas={SELLO_DEL_EJEMPLO.personas}
                advertencia={SELLO_DEL_EJEMPLO.advertencia}
              />
            </div>
            <BolsaDePalabras artefacto={ARTEFACTO_DE_VECTORES} tema={tema} />
          </div>
        </details>
      </div>

      {artefactoAlDia && faltantes === 0 ? null : (
        // Sólo lo que le pasa a quien lee. La versión vieja cerraba con un
        // comando de terminal, que es un mensaje de desarrollador en la pantalla
        // de un lector; cómo se regenera el ejemplo vive en el README del script.
        <p className={`border-violeta mb-6 border-l-2 pl-4 text-[15px] leading-[1.55] ${texto}`}>
          Este ejemplo quedó desfasado de sus propias frases
          {faltantes > 0 ? ` (faltan ${String(faltantes)} frases)` : ''}: lo que se dibuja abajo
          puede no corresponder a lo que dicen. Sirve para mirar, no para citar.
        </p>
      )}

      <div className="mb-3 grid grid-cols-3 gap-2" role="group" aria-label="Elegí el escenario">
        {columnas.map(({ escenario }, i) => (
          <button
            key={escenario.id}
            type="button"
            aria-pressed={escenario.id === activo}
            onClick={() => {
              setActivo(escenario.id);
              setEnfocado(null);
            }}
            className={`font-space min-h-11 border px-3 py-3 text-left text-[12px] font-bold uppercase tracking-[0.08em] transition-colors ${
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

      <p className={`mb-3 max-w-[110ch] text-[15px] leading-[1.45] ${texto}`}>
        {columna.escenario.resumen}
      </p>

      <ExploradorConstelacion
        nucleos={columna.corte.nucleos}
        solas={columna.corte.solas}
        aristas={columna.corte.aristas}
        tema={tema}
        enfocado={abierto?.id ?? null}
        onEnfocar={enfocar}
        origen="ejemplo"
        compacto
        testId="constelacion-del-ejemplo"
        textosEjemplo={Object.fromEntries(columna.escenario.voces.map((v) => [v.id, v.texto]))}
      />

      <details className={`my-4 border-b ${borde} pb-3`}>
        <summary className="min-h-11 cursor-pointer py-3 text-sm underline">
          Qué cambia en este escenario
        </summary>
        <p className={`mb-6 max-w-[70ch] text-[14px] leading-[1.55] ${meta}`}>
          {enElUmbralDelEjemplo ? null : (
            <strong className={`font-semibold ${texto}`}>
              A {legible(UMBRAL_DEL_EJEMPLO)}, donde arranca el ejemplo:{' '}
            </strong>
          )}
          {columna.escenario.loQueSeVe}
        </p>
      </details>

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
          nota={`Este ejemplo mide parecido de palabras. Arranca en ${legible(UMBRAL_DEL_EJEMPLO)} y podés explorar de ${legible(UMBRAL_MINIMO)} a ${legible(UMBRAL_MAXIMO)}. Mover el nivel cambia las líneas visibles; no crea un acuerdo.`}
        />
      </div>

      <ListaDeNucleos
        nucleos={columna.corte.nucleos}
        orden={orden}
        onOrdenar={setOrden}
        enfocado={abierto ? abierto.id : null}
        onEnfocar={enfocar}
        tema={tema}
      />

      <details className={`mt-8 border-t ${borde} pt-4`}>
        <summary className="font-anton min-h-11 cursor-pointer text-2xl">
          Comparar los tres escenarios y sus límites
        </summary>
        <DeQueCuelgaLaLeccion escalera={escalera} tema={tema} />
        <TablaDeLosTres columnas={columnas} umbral={umbral} activo={activo} tema={tema} />
        <MandatoDelEjemplo escenario={columna.escenario} tema={tema} />
        <CoberturaDelEjemplo
          cobertura={columna.cobertura}
          advertencias={COBERTURA_Y_SESGO}
          tema={tema}
        />{' '}
      </details>
    </section>
  );
}
