import type { MouseEvent } from 'react';

/** El `id` del contenedor de la página que `RootLayout` pone alrededor de lo que renderiza cada ruta. */
export const ID_DEL_CONTENIDO = 'contenido';

/**
 * «Saltar al contenido»: el primer elemento enfocable de toda página.
 *
 * Quien navega con teclado o con lector de pantalla pasa por el header y su menú en cada
 * página; este enlace lo deja caer directo en lo que vino a leer. Invisible hasta que recibe
 * el foco. Lo maneja el código y no el ancla nativa para no ensuciar la dirección con
 * `#contenido` (que `useIrAlPrincipio` leería como una sección a la que saltar); el `href`
 * queda por si el script no corre.
 */
export function SaltarAlContenido() {
  const saltar = (evento: MouseEvent<HTMLAnchorElement>) => {
    const destino = document.getElementById(ID_DEL_CONTENIDO);
    if (!destino) return;
    evento.preventDefault();
    destino.focus();
  };
  return (
    <a
      href={`#${ID_DEL_CONTENIDO}`}
      onClick={saltar}
      className="bg-tinta text-papel border-papel font-space sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:border focus:px-5 focus:py-3 focus:text-xs focus:uppercase focus:tracking-[0.08em]"
    >
      Saltar al contenido
    </a>
  );
}
