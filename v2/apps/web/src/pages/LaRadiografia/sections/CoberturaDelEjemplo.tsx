import type { Cobertura } from '../ejemplos';
import type { Tema } from '../radiografia-data';

/**
 * § La cobertura y el sesgo de los tres escenarios — regla 2.
 *
 * **Toda síntesis muestra cobertura y sesgo**, y no en un pie de página en gris
 * de seis puntos. Va acá arriba, junto a la constelación, porque es la única
 * forma de que quien mire una mancha compacta sepa antes de sacar la conclusión
 * de qué no habló nadie.
 *
 * El caso que hace que esto valga la pena está en el escenario 1: el núcleo más
 * grande de todo el ejemplo dice «el país está mal» y **no tiene una sola voz de
 * Formosa**. Formosa está en el padrón, con población y con territorio, y con
 * cero voces. Sin ella la cobertura sería 8 de 8 y no diría nada.
 */

export interface CoberturaDelEjemploProps {
  readonly cobertura: Cobertura;
  readonly advertencias: readonly string[];
  readonly tema: Tema;
}

export function CoberturaDelEjemplo({ cobertura, advertencias, tema }: CoberturaDelEjemploProps) {
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-papel-borde';

  return (
    <section aria-labelledby="cobertura-del-ejemplo" className={`mt-10 border-t ${borde} pt-6`}>
      <h3
        id="cobertura-del-ejemplo"
        className={`font-space mb-3 text-[11px] font-bold uppercase tracking-[0.14em] ${meta}`}
      >
        Qué no puede ver este ejemplo
      </h3>

      {/* La cuenta, y nada más: la prosa de cada faltante la escribe el corpus
          en `COBERTURA_Y_SESGO` y se lista abajo. Repetirla acá dejaba la misma
          frase dos veces en la misma pantalla. */}
      <p className={`mb-4 max-w-[70ch] text-[16px] leading-[1.6] ${texto}`}>
        <strong className="font-semibold">
          {cobertura.conVoz.length} de {cobertura.provinciasDelPais} provincias
        </strong>{' '}
        tienen alguna voz acá. Una síntesis no puede decir nada cierto sobre lo que no vio, así que
        lo que este ejemplo no vio se escribe antes de que alguien saque una conclusión de él:
      </p>

      <ul className={`max-w-[70ch] space-y-2 text-[14px] leading-[1.55] ${meta}`}>
        {advertencias.map((linea) => (
          <li key={linea} className="flex gap-3">
            <span aria-hidden className={texto}>
              ·
            </span>
            <span>{linea}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
