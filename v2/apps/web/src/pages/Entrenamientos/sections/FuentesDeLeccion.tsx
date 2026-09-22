import type { Fuente } from '@v2/shared';

const fecha = (iso: string) => iso.split('-').reverse().join('/');

/**
 * Las fuentes de *El caso* (Ciclo 1, Decisión 11), debajo del cuerpo. Sin
 * fuentes no se pinta nada: una lección que sólo trae *El puente* no afirma un
 * dato, y un bloque vacío diciendo «sin fuentes» sería ruido.
 */
export function FuentesDeLeccion({ fuentes }: { fuentes: readonly Fuente[] }) {
  if (fuentes.length === 0) return null;
  return (
    <section aria-labelledby="fuentes-leccion" className="border-papel-borde mt-8 border-t pt-5">
      <h2
        id="fuentes-leccion"
        className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]"
      >
        De dónde sale el caso
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {fuentes.map((fuente) => (
          <li key={fuente.url} className="text-[15px] leading-snug">
            <a
              href={fuente.url}
              target="_blank"
              rel="noreferrer"
              className="text-tinta decoration-tinta/30 hover:text-violeta underline underline-offset-4"
            >
              {fuente.titulo} ↗
            </a>
            <span className="font-space text-tinta-50 ml-2 text-[10px] uppercase tracking-[0.08em]">
              consultada {fecha(fuente.consultada)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
