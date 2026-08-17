import { REGLA_DEL_MANDATO } from '../ejemplos';

import type { CifrasDeCorroboracion, CifrasDeLegitimidad, Cobertura, Escenario } from '../ejemplos';
import type { CorteDelEscenario, MedidaDelEscenario } from '../ejemplos-vista';
import type { Tema } from '../radiografia-data';

/**
 * § La tabla de los tres — el experimento entero, en una imagen.
 *
 * Spec: `docs/specs/2026-08-01-el-mapa-simulacion.md` §5.4.
 *
 * > «La composición no entra en la legitimidad. Qué dice la gente cambia *qué
 * > se puede hacer*, no *cuánto representa*.»
 *
 * La tabla tiene tres mitades —y la del medio es la trampa:
 *
 *  1. **La legitimidad**, que es idéntica en las tres columnas hasta el último
 *     decimal. No es una casualidad del corpus: `retratoMedido` recibe por voz
 *     un territorio, una fecha y un tipo, y **no lee el texto**. Como los tres
 *     escenarios comparten el padrón entero, esta mitad es la misma por álgebra.
 *  2. **La forma de la constelación**, donde la bronca gana. Gana de verdad: su
 *     parecido mediano casi triplica al de los otros dos, y su mancha aguanta el
 *     doble de umbral. **La imagen más impresionante es la de la columna que no
 *     habilita nada.**
 *  3. **Lo que se puede hacer**, donde la bronca queda en cero y el dato tiene
 *     45 señales corroboradas por dos personas distintas o más.
 *
 * Leídas en ese orden, las tres mitades dicen solas lo que ningún cartel tenía
 * que decir: cuanto más precisa, útil y cierta es la información que se carga,
 * mejor es el mandato que se puede escribir. La legitimidad no se compra con
 * precisión —ya estaba— y la convergencia tampoco la mide.
 */

export interface ColumnaDeLosTres {
  readonly escenario: Escenario;
  readonly legitimidad: CifrasDeLegitimidad;
  readonly corroboracion: CifrasDeCorroboracion;
  readonly cobertura: Cobertura;
  readonly medida: MedidaDelEscenario;
  readonly corte: CorteDelEscenario;
}

export interface TablaDeLosTresProps {
  readonly columnas: readonly ColumnaDeLosTres[];
  readonly umbral: number;
  readonly activo: string;
  readonly tema: Tema;
}

const entero = (n: number): string => n.toLocaleString('es-AR');
const decimal = (n: number, digitos = 2): string => n.toFixed(digitos).replace('.', ',');
const umbralLegible = (n: number | null): string => (n === null ? '—' : decimal(n));

interface Fila {
  readonly rotulo: string;
  readonly glosa?: string;
  readonly valores: readonly string[];
  readonly fuerte?: boolean;
}

const filasDeLegitimidad = (columnas: readonly ColumnaDeLosTres[]): readonly Fila[] => {
  const primera = columnas[0];
  const mudas = primera
    ? `Sobre ${entero(primera.cobertura.provinciasDelPais)}. De las otras ${entero(
        primera.cobertura.provinciasDelPais - primera.cobertura.conVoz.length,
      )} no habló nadie, y ${entero(primera.cobertura.fueraDelPadron.length)} ni siquiera están en el padrón: de ésas el ejemplo no puede decir nada, y «no dice nada» no es «no pasa nada».`
    : '';

  return [
    {
      rotulo: 'Voces',
      glosa: 'Filas, no personas.',
      valores: columnas.map((c) => entero(c.legitimidad.voces)),
    },
    {
      rotulo: 'Actores distintos',
      glosa: 'Personas. Menos que las voces, y por eso la distinción importa.',
      valores: columnas.map((c) => entero(c.legitimidad.actores)),
    },
    {
      rotulo: 'Provincias con voz',
      glosa: mudas,
      valores: columnas.map((c) => entero(c.legitimidad.provincias)),
    },
    {
      rotulo: 'Períodos sostenidos',
      glosa: `Meses en los que un territorio cruzó el piso y lo sostuvo, ponderados por población. ${REGLA_DEL_MANDATO.comoSeLee}`,
      valores: columnas.map((c) => decimal(c.legitimidad.periodosSostenidos)),
    },
    {
      rotulo: 'Alcance × persistencia',
      glosa: 'Los dos factores, y nada más entra acá.',
      valores: columnas.map(
        (c) => `${decimal(c.legitimidad.alcance, 3)} × ${decimal(c.legitimidad.persistencia, 3)}`,
      ),
    },
    {
      rotulo: 'Legitimidad',
      glosa: 'El mismo número en las tres columnas. El motor que lo calcula no lee el texto.',
      valores: columnas.map((c) => decimal(c.legitimidad.legitimidad, 3)),
      fuerte: true,
    },
  ];
};

const filasDeForma = (columnas: readonly ColumnaDeLosTres[]): readonly Fila[] => [
  {
    rotulo: 'Parecido mediano',
    glosa: 'Entre vecinas del grafo. Es la única cifra de acá que no depende del deslizador.',
    valores: columnas.map((c) => decimal(c.medida.medianaDeParecido, 3)),
    fuerte: true,
  },
  {
    rotulo: 'Núcleos',
    // Va chico y con la advertencia al lado a propósito: es la única lectura
    // de esta tabla que se da vuelta cuando se mueve el deslizador, y la
    // lección NO cuelga de ella. El argumento está arriba, en «de qué cuelga
    // la lección», y medido en `medirLaEscalera`.
    glosa: 'Se da vuelta con el umbral alto. La lección no cuelga de este número.',
    valores: columnas.map((c) => entero(c.corte.nucleos.length)),
  },
  {
    rotulo: 'El mayor',
    glosa:
      'Cuántas voces caen en el núcleo más grande. El de la bronca nunca es menor que el del dato, en ninguna posición del mando.',
    valores: columnas.map((c) => `${entero(c.corte.mayor)} de ${entero(c.legitimidad.voces)}`),
    fuerte: true,
  },
  {
    rotulo: 'Voces solas',
    glosa:
      'Nadie repitió lo que dijeron. No es un residuo: cuanto más preciso el corpus, más gente queda hablando sola, y eso aguanta el mando entero.',
    valores: columnas.map((c) => entero(c.corte.solas.length)),
    fuerte: true,
  },
  {
    rotulo: 'La mancha aguanta hasta',
    glosa: 'El umbral más alto al que la mitad del corpus sigue en un solo núcleo.',
    valores: columnas.map((c) => umbralLegible(c.medida.umbralDeLaMancha)),
  },
];

const filasDeMandato = (columnas: readonly ColumnaDeLosTres[]): readonly Fila[] => [
  {
    rotulo: 'Verificables',
    glosa: 'Sólo hechos y actos. Un deseo no se corrobora nunca: se delibera.',
    valores: columnas.map((c) => entero(c.corroboracion.verificables)),
  },
  {
    rotulo: 'Corroboradas',
    glosa: 'Dos actores distintos o más fueron a mirar y lo vieron.',
    valores: columnas.map((c) => entero(c.corroboracion.corroboradas)),
    fuerte: true,
  },
  {
    rotulo: 'Desmentidas',
    glosa: 'Alguien fue a mirar y no estaba. Se queda en el registro.',
    valores: columnas.map((c) => entero(c.corroboracion.desmentidas)),
  },
];

export function TablaDeLosTres({ columnas, umbral, activo, tema }: TablaDeLosTresProps) {
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';
  const bordeFuerte = nocturno ? 'border-oscuro-borde' : 'border-tinta';

  const grupo = (nombre: string, glosa: string) => (
    <tr>
      <th
        scope="rowgroup"
        colSpan={columnas.length + 1}
        className={`font-space border-b-2 pb-2 pt-8 text-left text-[11px] font-bold uppercase tracking-[0.12em] ${bordeFuerte} ${texto}`}
      >
        {nombre}
        <span
          className={`ml-3 font-sans text-[12px] font-normal normal-case tracking-normal ${meta}`}
        >
          {glosa}
        </span>
      </th>
    </tr>
  );

  const filas = (lista: readonly Fila[]) =>
    lista.map((fila) => (
      <tr key={fila.rotulo} className={`border-b ${borde}`}>
        <th scope="row" className="max-w-[240px] py-4 pr-6 text-left align-top font-normal">
          <span className={`block text-[15px] leading-[1.35] ${texto}`}>{fila.rotulo}</span>
          {fila.glosa ? (
            <span className={`mt-1 block text-[12px] leading-[1.45] ${meta}`}>{fila.glosa}</span>
          ) : null}
        </th>
        {fila.valores.map((valor, i) => (
          <td
            key={columnas[i]?.escenario.id ?? String(i)}
            className={`py-4 pr-6 align-top tabular-nums ${
              fila.fuerte ? `font-anton text-[24px] leading-[1.1] ${texto}` : `text-[16px] ${texto}`
            } ${columnas[i]?.escenario.id === activo ? '' : 'opacity-70'}`}
          >
            {valor}
          </td>
        ))}
      </tr>
    ));

  return (
    <div className="mt-12 overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <caption className={`mb-4 text-left text-[13px] leading-[1.5] ${meta}`}>
          Las tres columnas son el mismo padrón: las mismas 63 voces, las mismas 44 personas, los
          mismos 8 territorios, los mismos 12 meses. Lo único distinto es lo que esas personas
          escribieron. Los números de «la forma» se recalculan con el deslizador, hoy en{' '}
          <strong className={texto}>{decimal(umbral)}</strong>.
        </caption>

        <thead>
          <tr className={`border-b-2 ${bordeFuerte}`}>
            <th scope="col" className={`font-space pb-3 pr-6 text-[11px] uppercase ${meta}`}>
              &nbsp;
            </th>
            {columnas.map(({ escenario }, i) => (
              <th
                key={escenario.id}
                scope="col"
                className={`pb-3 pr-6 align-bottom ${escenario.id === activo ? '' : 'opacity-70'}`}
              >
                <span className={`font-anton block text-[20px] leading-[1.1] ${texto}`}>
                  {escenario.titulo}
                </span>
                <span
                  className={`font-space mt-1 block text-[11px] uppercase tracking-[0.1em] ${meta}`}
                >
                  Escenario {i + 1}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {grupo('La legitimidad', 'Idéntica en las tres. Sale de alcance × persistencia.')}
          {filas(filasDeLegitimidad(columnas))}

          {grupo('La forma de la constelación', 'Acá gana la bronca, y no sirve de nada.')}
          {filas(filasDeForma(columnas))}

          {grupo('Lo que se puede hacer', 'Acá la bronca queda en cero.')}
          {filas(filasDeMandato(columnas))}

          <tr className={`border-b ${borde}`}>
            <th scope="row" className="max-w-[240px] py-4 pr-6 text-left align-top font-normal">
              <span className={`block text-[15px] leading-[1.35] ${texto}`}>
                El mandato que habilita
              </span>
              <span className={`mt-1 block text-[12px] leading-[1.45] ${meta}`}>
                Escrito como se le exige algo a alguien, no como un puntaje.
              </span>
            </th>
            {columnas.map(({ escenario }) => (
              <td
                key={escenario.id}
                className={`py-4 pr-6 align-top ${escenario.id === activo ? '' : 'opacity-70'}`}
              >
                <p
                  className={`text-[15px] leading-[1.45] ${
                    escenario.mandato.hay ? texto : `font-anton text-[22px] leading-[1.1] ${texto}`
                  }`}
                >
                  {escenario.mandato.texto}
                </p>
                <p className={`mt-2 text-[12px] leading-[1.5] ${meta}`}>
                  {escenario.mandato.porQue}
                </p>
              </td>
            ))}
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td
              colSpan={columnas.length + 1}
              className={`border-t-2 pt-5 text-[15px] leading-[1.55] ${bordeFuerte} ${texto}`}
            >
              La mitad de arriba de esta tabla no se mueve y la de abajo sí:{' '}
              <strong className="font-semibold">
                cuanto más precisa, útil y cierta es la información que se carga, mejor es el
                mandato que se puede escribir
              </strong>
              . Lo que no mejora —ni un decimal— es cuánto representan las 63 personas. Eso ya
              estaba, y escribir mejor no lo compra.
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
