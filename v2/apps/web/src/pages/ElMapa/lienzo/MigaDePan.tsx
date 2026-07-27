import type { Altitud } from './useAltitud';

/**
 * La miga de pan es también el camino de vuelta (spec 1 §4.1) y el control de
 * zoom operable por teclado (§4.2).
 *
 * El zoom no puede ser solo gestual: entrar a una provincia se hace con click
 * o con Enter sobre su forma, y salir se hace desde acá, con un botón real que
 * el tabulador alcanza. Un mapa que solo se navega con dos dedos deja afuera a
 * quien no puede hacer ese gesto.
 */
export interface MigaDePanProps {
  altitud: Altitud;
  provincia: string | null;
  onVolver: () => void;
}

export function MigaDePan({ altitud, provincia, onVolver }: MigaDePanProps) {
  const enPais = altitud === 'pais';

  return (
    <nav
      aria-label="Dónde estás en el mapa"
      className="font-space text-tinta-30 mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]"
    >
      {enPais ? (
        <span aria-current="page">Argentina</span>
      ) : (
        <>
          <button
            type="button"
            onClick={onVolver}
            className="hover:text-tinta focus-visible:ring-violeta underline underline-offset-4 outline-none focus-visible:ring-2"
          >
            Argentina
          </button>
          <span aria-hidden>›</span>
          <span aria-current="page" className="text-tinta">
            {provincia}
          </span>
        </>
      )}
    </nav>
  );
}
