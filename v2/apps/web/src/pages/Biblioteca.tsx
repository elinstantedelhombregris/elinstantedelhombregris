import { BitacoraReciente } from './Biblioteca/sections/BitacoraReciente';
import { CierreBiblioteca } from './Biblioteca/sections/CierreBiblioteca';
import { CronicaDestacada } from './Biblioteca/sections/CronicaDestacada';
import { EntrenamientosCurados } from './Biblioteca/sections/EntrenamientosCurados';
import { IndiceEnsayos } from './Biblioteca/sections/IndiceEnsayos';
import { ManifiestoDestacado } from './Biblioteca/sections/ManifiestoDestacado';
import { PortadaBiblioteca } from './Biblioteca/sections/PortadaBiblioteca';
import { PuertaDeHoy } from './Biblioteca/sections/PuertaDeHoy';

/**
 * La biblioteca — página 3.1 «Papel y Tinta», rediseñada por «el catálogo
 * vivo» (docs/specs/2026-08-20-el-catalogo-vivo-biblioteca.md). Portada con
 * catálogo, la puerta de hoy (con señalador), y los cinco estantes § 01–05:
 * manifiesto, la estantería de ciclos, la vidriera de entrenamientos, la
 * crónica del país que viene (D9) y la bitácora. El chrome papel lo pone
 * RootLayout.
 */
export function Biblioteca() {
  return (
    <main>
      <PortadaBiblioteca />
      <PuertaDeHoy />
      <ManifiestoDestacado />
      <IndiceEnsayos />
      <EntrenamientosCurados />
      <CronicaDestacada />
      <BitacoraReciente />
      <CierreBiblioteca />
    </main>
  );
}

export default Biblioteca;
