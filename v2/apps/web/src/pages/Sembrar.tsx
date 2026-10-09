import { useState } from 'react';
import { Link } from 'wouter';

import { AsistenteSemilla } from './Sembrar/sections/AsistenteSemilla';
import { CertificadoSemilla } from './Sembrar/sections/CertificadoSemilla';
import { PortadaSembrar } from './Sembrar/sections/PortadaSembrar';
import {
  borrarSemilla,
  guardarSemilla,
  leerSemilla,
  type SemillaGuardada,
} from './Sembrar/sembrar-data';

/**
 * Sembrar — página 2.5 «Papel y Tinta»
 * (docs/specs/2026-07-24-sembrar-papel-y-tinta.md). Asistente de 3 pasos →
 * certificado semilla, con persistencia local de la vuelta. El chrome papel
 * lo pone RootLayout.
 */
export function Sembrar() {
  const [semilla, setSemilla] = useState<SemillaGuardada | null>(leerSemilla);

  const onPlantada = (s: SemillaGuardada) => {
    guardarSemilla(s);
    setSemilla(s);
  };
  const onPlantarOtra = () => {
    borrarSemilla();
    setSemilla(null);
  };

  return (
    <main className="mx-auto max-w-[900px] px-10 py-[72px] max-[560px]:px-5">
      <PortadaSembrar plantada={semilla !== null} />
      <section className="my-7 border p-5">
        <h2 className="font-anton text-3xl">Una voluntad puede sostener una prueba.</h2>
        <p className="mt-3 leading-relaxed">
          Tu semilla expresa un compromiso personal. Si querés trabajar con otros en un diseño
          concreto, elegí una ficha, compará alternativas y proponé una prueba con alcance, fecha de
          revisión y criterios de pausa. La responsabilidad se acepta antes de empezar y el
          resultado vuelve a quienes participaron.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <Link className="text-violeta inline-flex min-h-11 items-center underline" href="/fichas">
            Encontrar un diseño para probar
          </Link>
          <Link
            className="text-violeta inline-flex min-h-11 items-center underline"
            href="/mi-espacio"
          >
            Volver a mis procesos
          </Link>
        </div>
      </section>
      {semilla === null ? (
        <AsistenteSemilla onPlantada={onPlantada} />
      ) : (
        <CertificadoSemilla semilla={semilla} onPlantarOtra={onPlantarOtra} />
      )}
    </main>
  );
}

export default Sembrar;
