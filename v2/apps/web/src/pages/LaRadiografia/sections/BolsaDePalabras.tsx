import type { ArtefactoDeVectores } from '../ejemplos/artefacto';
import type { Tema } from '../radiografia-data';

/**
 * § De qué está hecha la convergencia que se ve acá.
 *
 * Enmienda `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md` §4 · spec
 * `docs/specs/2026-08-12-la-radiografia.md` §4.1.
 *
 * **Esto no es un descargo, es una procedencia** — la misma clase de dato que
 * el corte y el modelo en la cabecera de la página viva. Los vectores de este
 * ejemplo los hizo `EmbebedorFalso`, que es una **bolsa de palabras**: cuenta
 * palabras, las proyecta por hash y normaliza. No sabe que «guita» y «plata»
 * son lo mismo, ni que «no sale agua» y «estamos sin suministro» dicen una sola
 * cosa.
 *
 * De ahí se sigue algo que la pantalla tiene que decir con todas las letras y
 * no dejar que el lector deduzca: **toda convergencia que se vea acá es léxica
 * por construcción**. Dos frases se juntan porque comparten palabras, no porque
 * digan lo mismo. Con este motor **no se puede demostrar una tesis sobre
 * significado**, y el ejemplo no la demuestra: lo que enseña es qué hace el
 * instrumento con textos vagos y con textos precisos, que es una diferencia de
 * vocabulario antes que de sentido, y esa diferencia el falso sí la ve.
 *
 * Lo que cambia el día que haya un modelo de verdad —`bge-m3` por Ollama— y lo
 * que no:
 *
 *  - **cambian los números.** Los cosenos de un modelo viven más arriba, así que
 *    el umbral del ejemplo se recalibra **midiendo otra vez**, no heredando;
 *  - **cambia el sustento de la lección**, que pasaría a ser sobre significado
 *    y no sobre palabras compartidas;
 *  - **no cambia** que la lección se mide en cada corrida y no se afirma: los
 *    tests de `__tests__` la vuelven a medir con el motor de verdad.
 */

export interface BolsaDePalabrasProps {
  readonly artefacto: ArtefactoDeVectores;
  readonly tema: Tema;
}

export function BolsaDePalabras({ artefacto, tema }: BolsaDePalabrasProps) {
  const nocturno = tema === 'nocturno';
  const meta = nocturno ? 'text-oscuro-meta' : 'text-tinta-50';
  const texto = nocturno ? 'text-oscuro-texto' : 'text-tinta';
  const borde = nocturno ? 'border-oscuro-borde' : 'border-tinta';

  return (
    <section
      aria-labelledby="bolsa-de-palabras"
      className={`mb-10 border-l-4 ${borde} py-1 pl-5 md:pl-6`}
    >
      <h3
        id="bolsa-de-palabras"
        className={`font-anton mb-3 text-[clamp(22px,2.4vw,30px)] leading-[1.1] ${texto}`}
      >
        Lo que se ve acá es parecido de palabras, no de sentido.
      </h3>

      <p className={`mb-3 max-w-[70ch] text-pretty text-[16px] leading-[1.6] ${texto}`}>
        Estos vectores no los hizo un modelo de lenguaje. Los hizo{' '}
        <code className="font-space text-[14px]">{artefacto.modelo}</code>, que es una{' '}
        <strong className="font-semibold">bolsa de palabras</strong>: cuenta las palabras de cada
        frase y las proyecta a {artefacto.dimensiones.toLocaleString('es-AR')} dimensiones por hash.
        No sabe que «guita» y «plata» son lo mismo. Así que{' '}
        <strong className="font-semibold">
          toda la convergencia que ves en esta página es léxica por construcción
        </strong>
        : dos frases se juntan porque comparten palabras, no porque digan lo mismo.
      </p>

      <p className={`mb-3 max-w-[70ch] text-pretty text-[16px] leading-[1.6] ${texto}`}>
        Con este motor <strong className="font-semibold">no se puede demostrar</strong> una tesis
        sobre significado, y acá no se demuestra ninguna. Lo que el ejemplo enseña es más chico y es
        cierto: qué hace el instrumento cuando la gente escribe vago y qué hace cuando escribe
        preciso. Eso es, antes que nada, una diferencia de vocabulario — y el vocabulario es
        justamente lo único que una bolsa de palabras sabe leer.
      </p>

      <p className={`max-w-[70ch] text-[14px] leading-[1.55] ${meta}`}>
        El día que estos vectores salgan de un modelo de verdad —«bge-m3» por Ollama, que es lo que
        embebe el corpus vivo— los números de esta página van a cambiar y se van a{' '}
        <strong className={`font-semibold ${texto}`}>volver a medir</strong>: el umbral se recalibra
        midiendo, no heredando. Hasta entonces esto se lee como lo que es. Va acá arriba y no en un
        pie por el mismo motivo que el corte y el modelo van en la cabecera de la página viva: la
        procedencia se declara antes de la imagen, no después de la conclusión.
      </p>
    </section>
  );
}
