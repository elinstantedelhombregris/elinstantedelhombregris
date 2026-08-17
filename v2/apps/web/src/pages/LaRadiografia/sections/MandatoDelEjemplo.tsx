import type { Escenario } from '../ejemplos';
import type { Tema } from '../radiografia-data';

/**
 * § El mandato del escenario abierto — cómo se comprueba el incumplimiento.
 *
 * La tabla ya dice **qué** habilita cada escenario y **por qué** habilita eso y
 * no más. Lo que la tabla no puede mostrar sin volverse ilegible es la tercera
 * pregunta, que es la que separa un pedido de una obligación: **qué día, en qué
 * puerta y quién comprueba que no se cumplió**.
 *
 * En el escenario 1 esa pregunta no tiene respuesta, y no por falta de ganas.
 * Un mandato sin lugar no tiene puerta, sin cosa no tiene qué mirar y sin fecha
 * no tiene día. Que eso se lea acá, escrito, es lo que impide que la
 * constelación más linda de las tres pase por la más útil.
 */

export interface MandatoDelEjemploProps {
  readonly escenario: Escenario;
  readonly tema: Tema;
}

export function MandatoDelEjemplo({ escenario, tema }: MandatoDelEjemploProps) {
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';
  const { mandato } = escenario;

  return (
    <section aria-labelledby="mandato-del-ejemplo" className={`mt-10 border-t ${borde} pt-6`}>
      <h3
        id="mandato-del-ejemplo"
        className={`font-space mb-3 text-[11px] font-bold uppercase tracking-[0.14em] ${meta}`}
      >
        {escenario.titulo} · cómo se comprueba el incumplimiento
      </h3>

      {mandato.comoSeVerifica === null ? (
        <p className={`max-w-[70ch] text-[17px] leading-[1.6] ${texto}`}>
          No hay nada que comprobar, porque no hay nada exigido. Y eso no es una falla del
          instrumento: es lo que 63 voces de bronca alcanzan a sostener. Son verdaderas como estado
          de ánimo y no alcanzan como mandato, y decirlo no es despreciarlas — es no usarlas para
          algo que no pueden aguantar.
        </p>
      ) : (
        <p className={`max-w-[70ch] text-[17px] leading-[1.6] ${texto}`}>
          {mandato.comoSeVerifica}
        </p>
      )}

      <p className={`mt-4 max-w-[70ch] text-[13px] leading-[1.55] ${meta}`}>
        Los responsables están nombrados por su función y nunca por su razón social: este corpus es
        sintético, y un ejemplo no le puede imputar un incumplimiento fechado a una empresa ni a un
        municipio que existen de verdad.
      </p>
    </section>
  );
}
