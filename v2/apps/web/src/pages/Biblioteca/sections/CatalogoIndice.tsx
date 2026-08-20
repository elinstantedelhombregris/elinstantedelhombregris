import { ESTANTES } from '../biblioteca-data';

import { saltarASeccion } from '~/lib/ir-al-principio';

/**
 * El catálogo (spec 2026-08-20 §1): el inventario de la portada como índice
 * tipográfico con puntos conductores — llevan el ojo del nombre a la cifra,
 * eso significan (border-bottom dotted: tipografía, no decoración). Toda
 * cifra sale de ESTANTES (registries). El salto usa saltarASeccion, que ya
 * respeta prefers-reduced-motion; sin JS queda el ancla nativa del href.
 */
export function CatalogoIndice() {
  return (
    <nav aria-label="Catálogo de la biblioteca" className="anim-fadeup mt-10 max-w-[720px]">
      {ESTANTES.map((estante) => (
        <a
          key={estante.ancla}
          href={`#${estante.ancla}`}
          onClick={(evento) => {
            if (saltarASeccion(estante.ancla)) evento.preventDefault();
          }}
          className="group hover:bg-papel-presionado flex items-baseline gap-x-3 gap-y-1 px-2 py-3 transition-colors duration-150 max-[560px]:flex-wrap"
        >
          <span className="font-space text-tinta-30 text-sm">{estante.num}</span>
          <span className="text-tinta group-hover:text-violeta text-[17px] font-semibold leading-snug transition-colors duration-150">
            {estante.nombre}
          </span>
          {/* Los puntos conductores son cosa de renglón ancho: en móvil el
              inventario baja a su propia línea y el ojo no necesita puente. */}
          <span
            aria-hidden
            className="border-tinta-30 mx-1 mb-[5px] min-w-6 flex-1 self-end border-b-2 border-dotted max-[560px]:hidden"
          />
          <span className="font-space text-tinta-50 shrink-0 text-[11px] uppercase tracking-[0.1em] max-[560px]:w-full max-[560px]:pl-7">
            {estante.inventario}
          </span>
        </a>
      ))}
    </nav>
  );
}
