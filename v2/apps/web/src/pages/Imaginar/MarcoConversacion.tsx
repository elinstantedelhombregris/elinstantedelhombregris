import type { ReactNode } from 'react';

/**
 * El marco de las tres preguntas dentro del panel del mapa.
 *
 * Imaginar ya no es una página: vive en el mapa, así que acá no hay título de
 * página ni hay modo de pantalla completa. La entrada y el paso al aporte
 * puntual van arriba; el recibo reutiliza el marco sin ellos.
 */
export function MarcoConversacion({
  entrada,
  irADirecto,
  children,
}: {
  entrada?: string;
  /** Lleva al aporte puntual sin perder lo escrito en las tres preguntas. */
  irADirecto?: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-label="Imaginar mi Argentina" className="text-tinta">
      {entrada ? (
        <>
          <p className="font-space text-violeta text-[11px] uppercase tracking-[.14em]">
            Imaginar mi Argentina
          </p>
          <p className="text-tinta-75 mt-3 text-sm leading-relaxed">{entrada}</p>
        </>
      ) : null}
      {entrada && irADirecto ? (
        <button
          type="button"
          data-ir-directo
          onClick={irADirecto}
          className="text-violeta mt-3 min-h-11 text-left text-sm leading-snug underline"
        >
          ¿Querés contar algo puntual — un problema, una necesidad, algo que ya funciona? Cargalo
          directo →
        </button>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
