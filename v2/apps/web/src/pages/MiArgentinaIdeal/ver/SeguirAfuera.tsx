import { EnlaceVer } from './piezas';

/**
 * Hacia dónde sigue la visión (spec §7): la lupa de la Radiografía para esta campaña, la
 * devolución que el equipo firma a partir de Ver y las campañas que juntan gente para abrir.
 */
export function SeguirAfuera({ campanaId }: { campanaId: string }) {
  return (
    <nav aria-label="Más allá de la visión" className="border-tinta flex flex-col border-t-2 pt-4">
      <EnlaceVer href={`/la-radiografia?${new URLSearchParams({ campana: campanaId }).toString()}`}>
        Mirarlo con lupa →
      </EnlaceVer>
      <EnlaceVer href="/sintesis-nacional">La devolución firmada de cada edición →</EnlaceVer>
      <EnlaceVer href="/campanas">Campañas que quieren abrir →</EnlaceVer>
    </nav>
  );
}
