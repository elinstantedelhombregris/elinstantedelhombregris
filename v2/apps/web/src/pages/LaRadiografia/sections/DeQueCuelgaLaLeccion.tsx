import type { Escalera } from '../ejemplos-vista';
import type { Tema } from '../radiografia-data';

/**
 * § De qué cuelga la lección — y de qué no.
 *
 * Enmienda `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md` §4.
 *
 * El ejemplo afirma que **cuanto más preciso escribe la gente, peor se ve la
 * imagen**. Hay tres maneras de medir «peor se ve» y no dicen lo mismo cuando
 * se barre el mando entero. El argumento de por qué se eligió colgar la lección
 * del **tamaño del mayor** y de las **voces solas** —y no del conteo de
 * núcleos— está en `medirLaEscalera`, en `ejemplos-vista.ts`. Acá se imprime.
 *
 * **Los tres números salen de barrer el mando, no de una nota.** Se recalculan
 * en cada carga con el motor de verdad, incluido el que le queda mal a la
 * página. Esconder ese —o, peor, acertarle a un rango del deslizador donde no
 * se note— sería fabricar la conclusión con la perilla, que es exactamente el
 * uso contra el que este ejemplo entero está escrito.
 */

export interface DeQueCuelgaLaLeccionProps {
  readonly escalera: Escalera;
  readonly tema: Tema;
}

const legible = (n: number): string => n.toFixed(2).replace('.', ',');

export function DeQueCuelgaLaLeccion({ escalera, tema }: DeQueCuelgaLaLeccionProps) {
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';

  const { pasos, cadena, extremos, seDaVuelta } = escalera;
  const de = (n: number): string => `${String(n)} de ${String(pasos)}`;

  /**
   * La frase de cada tarjeta se **arma con el número**, y no se escribe al lado
   * de él. Una prosa fija diciendo «nunca es menor» arriba de un contador que
   * mide otra cosa es la manera más fácil de que la pantalla mienta sin que
   * nadie la toque: alcanza con que cambie una frase del corpus.
   */
  const veredicto = (cuenta: number, siempre: string, aVeces: string): string =>
    cuenta === pasos
      ? `${siempre} Aguanta las ${String(pasos)} posiciones del mando.`
      : `${aVeces} Aguanta ${de(cuenta)} posiciones del mando; en las otras ${String(
          pasos - cuenta,
        )} no.`;

  const lecturas = [
    {
      clave: 'mayor',
      rotulo: 'El tamaño del mayor',
      cuenta: de(extremos.mayor),
      sostiene: extremos.mayor === pasos,
      glosa: `Cuántas voces caen en la mancha más grande. ${veredicto(
        extremos.mayor,
        'La del corpus vago nunca es menor que la del preciso.',
        'La del corpus vago es casi siempre mayor que la del preciso.',
      )} Ordenando los tres escenarios en fila, ${de(cadena.mayor)}.`,
    },
    {
      clave: 'solas',
      rotulo: 'Las voces solas',
      cuenta: de(extremos.solas),
      sostiene: extremos.solas === pasos,
      glosa: `Cuántas voces no repitió nadie. ${veredicto(
        extremos.solas,
        'El corpus preciso nunca deja menos gente hablando sola que el vago.',
        'El corpus preciso casi siempre deja más gente hablando sola que el vago.',
      )} Ordenando los tres en fila, ${de(cadena.solas)}. Y no es un residuo: es el dato.`,
    },
    {
      clave: 'conteo',
      rotulo: 'El conteo de núcleos',
      cuenta: de(extremos.conteo),
      sostiene: extremos.conteo === pasos,
      glosa: `Cuántos núcleos hay. ${veredicto(
        extremos.conteo,
        'El corpus vago nunca muestra más núcleos que el preciso.',
        'El corpus vago pasa a mostrar más núcleos que el preciso cuando sube el umbral: la mancha se desgrana en pedacitos y el preciso a esa altura casi no tiene ninguno.',
      )} Ordenando los tres en fila, ${de(cadena.conteo)}${
        seDaVuelta === null ? '' : `, y se da vuelta desde ${legible(seDaVuelta)}`
      }.`,
    },
  ];

  const firmes = lecturas.filter((l) => l.sostiene).length;

  return (
    <section aria-labelledby="de-que-cuelga" className={`mt-12 border-t ${borde} pt-8`}>
      <h3
        id="de-que-cuelga"
        className={`font-anton mb-3 text-[clamp(22px,2.4vw,30px)] leading-[1.1] ${texto}`}
      >
        La lección cuelga del tamaño de la mancha y de las voces solas. No del conteo de núcleos.
      </h3>

      <p className={`mb-6 max-w-[70ch] text-pretty text-[16px] leading-[1.6] ${texto}`}>
        Hay tres maneras de medir «se ve peor», y barriendo las {pasos} posiciones del deslizador
        una por una <strong className="font-semibold">no dicen lo mismo</strong>: {firmes} de las
        tres aguantan el mando entero y el resto se da vuelta en alguna parte. La lección no cuelga
        del conteo de núcleos, y no porque el número quede feo — cuelga de las otras dos porque{' '}
        <em>son</em> la lección: qué tan grande es la mancha y cuánta gente queda hablando sola. En
        vez de elegir la banda del deslizador donde el conteo queda lindo, el ejemplo dejó de colgar
        de él y lo muestra igual, con su número.
      </p>

      <dl className="grid gap-0 sm:grid-cols-3">
        {lecturas.map((lectura) => (
          <div key={lectura.clave} className={`border-t-2 py-4 pr-6 ${borde}`}>
            <dt className={`font-space text-[11px] uppercase tracking-[0.1em] ${meta}`}>
              {lectura.rotulo}
            </dt>
            <dd
              className={`font-anton mt-1 text-[26px] tabular-nums leading-[1.05] ${texto} ${
                lectura.sostiene ? '' : 'opacity-70'
              }`}
            >
              {lectura.cuenta}
              <span className={`font-space ml-2 align-middle text-[11px] uppercase ${meta}`}>
                {lectura.sostiene ? 'aguanta' : 'se da vuelta'}
              </span>
            </dd>
            <dd className={`mt-2 text-[13px] leading-[1.5] ${meta}`}>{lectura.glosa}</dd>
          </div>
        ))}
      </dl>

      <p className={`mt-6 max-w-[70ch] text-[14px] leading-[1.55] ${meta}`}>
        Que el conteo se dé vuelta no es una anomalía de este corpus: es aritmética de un umbral
        alto sobre un grafo denso, y le va a pasar a cualquier corpus vago. Por eso los números que
        la tabla de abajo pone en grande son{' '}
        <strong className={`font-semibold ${texto}`}>el mayor y las voces solas</strong>, y el de
        núcleos va al lado, chico, con su advertencia. Los tres se recalculan en cada carga con el
        motor de verdad: acá no hay una frase escrita al lado de un número que mide otra cosa.
      </p>
    </section>
  );
}
