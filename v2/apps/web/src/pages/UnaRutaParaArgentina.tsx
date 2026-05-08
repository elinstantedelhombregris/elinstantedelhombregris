import { Compromiso } from './UnaRutaParaArgentina/sections/Compromiso';
import { Phases } from './UnaRutaParaArgentina/sections/Phases';
import { PlanesGrid } from './UnaRutaParaArgentina/sections/PlanesGrid';
import { Roles } from './UnaRutaParaArgentina/sections/Roles';

export function UnaRutaParaArgentina() {
  return (
    <main className="container mx-auto max-w-5xl space-y-20 px-4 py-20">
      <header className="text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Una ruta</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Una ruta para Argentina.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          De la chispa individual al país habitable. Cinco fases, tres roles, 22 PLANs. La ruta no es nueva:
          es la que la democracia siempre dijo que iba a ser, y nunca terminó de cumplir.
        </p>
      </header>

      <Phases />
      <Roles />
      <PlanesGrid />
      <Compromiso />
    </main>
  );
}

export default UnaRutaParaArgentina;
