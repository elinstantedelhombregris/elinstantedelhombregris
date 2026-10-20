import { useEffect, useRef, useState } from 'react';

import { dibujarPapelito, type ContenidoDeImagen } from './imagen-para-compartir';

import { BotonAccion } from '~/components/participacion/Elementos';

export interface CompartirProps {
  contenido: ContenidoDeImagen;
  /** La dirección que se comparte, absoluta o relativa al sitio. */
  enlace: string;
  /** El texto que acompaña: «¿Y vos? Sumá el tuyo». */
  texto: string;
  /** El rótulo del botón. */
  rotulo?: string;
  nombreDeArchivo?: string;
}

type Estado =
  | { tipo: 'quieto' }
  | { tipo: 'listo' }
  | { tipo: 'copiado' }
  | { tipo: 'manual'; enlace: string };

/**
 * Compartir con la hoja del teléfono: con la imagen si el navegador deja mandar
 * archivos, con el enlace si no, y si tampoco, copiando el enlace. La imagen se
 * muestra igual, para que la persona vea qué está por compartir.
 */
export function Compartir({
  contenido,
  enlace,
  texto,
  rotulo = 'Compartir',
  nombreDeArchivo = 'mi-argentina-ideal.png',
}: CompartirProps) {
  const lienzo = useRef<HTMLCanvasElement | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>({ tipo: 'quieto' });
  const absoluto = new URL(enlace, window.location.origin).toString();

  useEffect(() => {
    const c = document.createElement('canvas');
    lienzo.current = c;
    let vivo = true;
    void dibujarPapelito(c, contenido)
      .then(() => {
        if (vivo) setImagen(c.toDataURL('image/png'));
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [contenido]);

  const compartir = async () => {
    try {
      const c = lienzo.current;
      const blob = c
        ? await new Promise<Blob | null>((ok) => {
            c.toBlob(ok, 'image/png');
          })
        : null;
      const archivo = blob ? new File([blob], nombreDeArchivo, { type: 'image/png' }) : null;
      const conArchivo = archivo
        ? { title: 'Mi Argentina ideal', text: texto, url: absoluto, files: [archivo] }
        : null;
      if (conArchivo && 'canShare' in navigator && navigator.canShare(conArchivo)) {
        await navigator.share(conArchivo);
        setEstado({ tipo: 'listo' });
        return;
      }
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Mi Argentina ideal', text: texto, url: absoluto });
        setEstado({ tipo: 'listo' });
        return;
      }
      await navigator.clipboard.writeText(`${texto} ${absoluto}`);
      setEstado({ tipo: 'copiado' });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setEstado({ tipo: 'manual', enlace: absoluto });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {imagen ? (
        <img
          src={imagen}
          alt={`Imagen para compartir: «${contenido.texto}»`}
          className="border-papel-borde w-full max-w-[280px] border shadow-[0_14px_26px_-18px_rgba(22,19,14,0.3)]"
        />
      ) : null}
      <BotonAccion tono="papel" className="w-full" onClick={() => void compartir()}>
        {rotulo}
      </BotonAccion>
      <p role="status" className="font-space text-tinta-75 text-xs">
        {estado.tipo === 'copiado'
          ? 'Copiamos el enlace. Pegalo donde quieras.'
          : estado.tipo === 'manual'
            ? `Copiá este enlace: ${estado.enlace}`
            : ''}
      </p>
    </div>
  );
}
