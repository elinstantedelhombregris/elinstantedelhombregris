import { fraseDeAviso, type AvisoDeRespuesta } from './avisos';

/**
 * Lo que se lee después de contestar: cuántas personas más dijeron lo mismo, o
 * que la región de quien mira ya cuenta en ese aporte. Antes de contestar no hay
 * ningún número, para que nadie copie. La región vacía queda puesta para que el
 * lector de pantalla anuncie cada frase nueva.
 */
export function AvisoRespuesta({ aviso }: { aviso: AvisoDeRespuesta | null }) {
  const frase = aviso ? fraseDeAviso(aviso) : null;
  return (
    <p
      role="status"
      aria-live="polite"
      className="font-archivo text-tinta-75 min-h-[1.5em] text-center text-[15px] leading-snug"
    >
      {frase ?? ''}
    </p>
  );
}
