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
      {semilla === null ? (
        <AsistenteSemilla onPlantada={onPlantada} />
      ) : (
        <CertificadoSemilla semilla={semilla} onPlantarOtra={onPlantarOtra} />
      )}
      <section aria-labelledby="sembrar-mas-lejos" className="my-7 border p-5">
        <h2 id="sembrar-mas-lejos" className="font-anton text-3xl">
          ¿Querés llevar tu compromiso más lejos?
        </h2>
        <p className="mt-3 leading-relaxed">
          Tu semilla es un compromiso personal. Si querés probar algo con otras personas, elegí una
          ficha y sumate.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <Link className="text-violeta inline-flex min-h-11 items-center underline" href="/fichas">
            Encontrar una ficha para probar
          </Link>
          <Link
            className="text-violeta inline-flex min-h-11 items-center underline"
            href="/mi-espacio"
          >
            Volver a Mi espacio
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Sembrar;
