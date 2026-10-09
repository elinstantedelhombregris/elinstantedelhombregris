import { useState } from 'react';

import { BotonAccion } from './Elementos';
export function CompartirProceso({ href, titulo }: { href: string; titulo: string }) {
  const [estado, setEstado] = useState('');
  const compartir = async () => {
    const url = new URL(href, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setEstado('Enlace copiado.');
    } catch {
      setEstado('No pudimos copiarlo solo. Copiá este enlace: ' + url);
    }
  };
  return (
    <div>
      <BotonAccion
        tono="papel"
        onClick={() => {
          void compartir();
        }}
      >
        {titulo}
      </BotonAccion>
      {estado && (
        <p role="status" className="text-tinta-50 mt-3 break-all text-sm">
          {estado}
        </p>
      )}
    </div>
  );
}
