import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

import { ESCENAS, type NombreDeEscena } from './registro';
import { soportaWebGL2 } from './webgl';

function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="font-space text-tinta-50 absolute inset-0 flex items-center justify-center p-6 text-center text-[11px] uppercase tracking-[0.08em]">
      {children}
    </div>
  );
}

const SIN_ESCENA = 'Tu navegador no puede mostrar esta animación. El texto de abajo la describe.';

/** Si el chunk de la escena no llega (red caída, deploy nuevo), queda el aviso y el resto del post sigue. */
class LimiteDeEscena extends Component<{ children: ReactNode }, { fallo: boolean }> {
  override state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  override render() {
    return this.state.fallo ? <Aviso>{SIN_ESCENA}</Aviso> : this.props.children;
  }
}

/**
 * Una escena de crónica. No baja nada hasta que el lector está cerca (600 px
 * antes de que entre en pantalla): quien no llega hasta acá no paga `three`.
 */
export function Escena({ nombre }: { nombre: NombreDeEscena }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cerca, setCerca] = useState(false);
  const [soporta] = useState(soportaWebGL2);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || !soporta) return;
    if (typeof IntersectionObserver === 'undefined') {
      setCerca(true);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setCerca(true);
          observador.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observador.observe(nodo);
    return () => {
      observador.disconnect();
    };
  }, [soporta]);

  const Contenido = ESCENAS[nombre];
  return (
    <div ref={ref} className="not-prose absolute inset-0" data-escena-montada={nombre}>
      {!soporta ? (
        <Aviso>{SIN_ESCENA}</Aviso>
      ) : cerca ? (
        <LimiteDeEscena>
          <Suspense fallback={<Aviso>Preparando la escena…</Aviso>}>
            <Contenido />
          </Suspense>
        </LimiteDeEscena>
      ) : null}
    </div>
  );
}
