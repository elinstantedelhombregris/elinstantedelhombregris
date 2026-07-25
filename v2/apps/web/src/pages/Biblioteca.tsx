import { BitacoraReciente } from './Biblioteca/sections/BitacoraReciente';
import { CierreBiblioteca } from './Biblioteca/sections/CierreBiblioteca';
import { EntrenamientosCurados } from './Biblioteca/sections/EntrenamientosCurados';
import { IndiceEnsayos } from './Biblioteca/sections/IndiceEnsayos';
import { ManifiestoDestacado } from './Biblioteca/sections/ManifiestoDestacado';
import { PortadaBiblioteca } from './Biblioteca/sections/PortadaBiblioteca';

/**
 * La biblioteca — página 3.1 «Papel y Tinta»
 * (docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md). Manifiesto,
 * ensayos por ciclo, la vidriera de entrenamientos y bitácora: las cuatro
 * secciones con destino vivo. La vidriera queda montada por 3.5
 * («§5 — Entrenamientos», el catálogo completo vive detrás en
 * /entrenamientos). El chrome papel lo pone RootLayout.
 */
export function Biblioteca() {
  return (
    <main>
      <PortadaBiblioteca />
      <ManifiestoDestacado />
      <IndiceEnsayos />
      <EntrenamientosCurados />
      <BitacoraReciente />
      <CierreBiblioteca />
    </main>
  );
}

export default Biblioteca;
