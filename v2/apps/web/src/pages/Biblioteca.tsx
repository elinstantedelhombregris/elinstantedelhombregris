import { BitacoraReciente } from './Biblioteca/sections/BitacoraReciente';
import { CierreBiblioteca } from './Biblioteca/sections/CierreBiblioteca';
import { IndiceEnsayos } from './Biblioteca/sections/IndiceEnsayos';
import { ManifiestoDestacado } from './Biblioteca/sections/ManifiestoDestacado';
import { PortadaBiblioteca } from './Biblioteca/sections/PortadaBiblioteca';

/**
 * La biblioteca — página 3.1 «Papel y Tinta»
 * (docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md). Manifiesto,
 * ensayos por ciclo y bitácora: las tres secciones con destino vivo. Los
 * entrenamientos están especificados en la spec y los monta 3.5, con su
 * catálogo — acá no se anuncia lo que todavía no se puede abrir.
 * El chrome papel lo pone RootLayout.
 */
export function Biblioteca() {
  return (
    <main>
      <PortadaBiblioteca />
      <ManifiestoDestacado />
      <IndiceEnsayos />
      <BitacoraReciente />
      <CierreBiblioteca />
    </main>
  );
}

export default Biblioteca;
