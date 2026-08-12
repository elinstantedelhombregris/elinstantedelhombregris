import { useState } from 'react';

import { PortadaLoQueFalta } from './LoQueFalta/sections/PortadaLoQueFalta';
import { RegistroDeFaltas } from './LoQueFalta/sections/RegistroDeFaltas';

import { PanelDejarFalta } from '~/components/papel/PanelDejarFalta';
import { useConteosDeFaltas } from '~/lib/queries/faltas';

/**
 * Lo que falta — el canal de escucha
 * (`docs/specs/2026-08-12-lo-que-falta.md`). Portada + registro + el panel.
 * El chrome papel lo pone RootLayout.
 */
export function LoQueFalta() {
  const [panelAbierto, setPanelAbierto] = useState(false);
  const conteos = useConteosDeFaltas();

  return (
    <main className="mx-auto max-w-[900px] px-10 py-[72px] max-[560px]:px-5">
      <PortadaLoQueFalta
        total={conteos.data?.total}
        onDejar={() => {
          setPanelAbierto(true);
        }}
      />
      <RegistroDeFaltas />

      {/* Nada de lo que la plataforma guarda es privado de la plataforma, y
          eso incluye la lista de sus propios defectos (spec §2.9). */}
      <section className="border-papel-borde mt-14 border-t pt-7">
        <div className="font-space text-tinta-50 mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">
          El registro entero
        </div>
        <p className="text-tinta-50 mb-4 max-w-[560px] text-[14px] leading-relaxed">
          Se baja completo, con las mismas columnas que ve la API pública. Sin llaves, sin IPs, sin
          nada de nadie.
        </p>
        <div className="font-space flex flex-wrap gap-5 text-[12px] uppercase tracking-[0.1em]">
          <a href="/api/v1/faltas/descarga.csv" className="text-violeta underline">
            CSV
          </a>
          <a href="/api/v1/faltas/descarga.jsonl" className="text-violeta underline">
            JSONL
          </a>
        </div>
      </section>

      <PanelDejarFalta
        abierto={panelAbierto}
        onCerrar={() => {
          setPanelAbierto(false);
        }}
        contexto={{ ruta: '/lo-que-falta' }}
      />
    </main>
  );
}

export default LoQueFalta;
