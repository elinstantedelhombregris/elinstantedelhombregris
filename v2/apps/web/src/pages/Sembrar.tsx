import { useState } from 'react';

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
    </main>
  );
}

export default Sembrar;
