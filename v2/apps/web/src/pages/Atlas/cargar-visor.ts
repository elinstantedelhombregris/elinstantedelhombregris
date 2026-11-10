/** Contrato con el visor estático (`public/atlas/atlas.js`, lo genera «Iniciativas Estratégicas/atlas/construir.mjs»). */
export interface VisorAtlas {
  iniciar: (grafo: unknown, raiz: HTMLElement) => () => void;
}

declare global {
  interface Window {
    __atlasBASTA?: VisorAtlas;
  }
}

const URL_CSS = '/atlas/atlas.css';
const URL_JS = '/atlas/atlas.js';
const URL_GRAFO = '/atlas/grafo.json';

function asegurarCss(): void {
  if (document.querySelector(`link[href="${URL_CSS}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = URL_CSS;
  document.head.appendChild(link);
}

/** Inyecta la hoja y el script del visor una sola vez y resuelve con su API. */
export function cargarVisor(): Promise<VisorAtlas> {
  asegurarCss();
  const ya = window.__atlasBASTA;
  if (ya) return Promise.resolve(ya);

  return new Promise<VisorAtlas>((resolver, rechazar) => {
    const listo = () => {
      const visor = window.__atlasBASTA;
      if (visor) resolver(visor);
      else rechazar(new Error('El visor no se definió'));
    };
    let script = document.querySelector<HTMLScriptElement>(`script[src="${URL_JS}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = URL_JS;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', listo, { once: true });
    script.addEventListener(
      'error',
      () => {
        // Un script fallido queda en el documento: se quita para que el próximo intento lo reinyecte.
        script.remove();
        rechazar(new Error('No se pudo cargar el visor'));
      },
      { once: true },
    );
  });
}

export async function cargarGrafo(signal: AbortSignal): Promise<unknown> {
  const res = await fetch(URL_GRAFO, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as unknown;
}
