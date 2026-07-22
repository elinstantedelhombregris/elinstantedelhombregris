import { useEffect, useState } from 'react';

/**
 * «El despertar» — firma award §10.7 del sistema Papel y Tinta.
 *
 * El sitio llega desaturado (velo gris) hasta la primera acción real del
 * usuario. Disparadores canónicos (v1.1): CTA «Dejar mi voz en el mapa»,
 * CTA header «Sembrar tu voz» (desktop y menú móvil), primera voz soltada.
 * El estado persiste en localStorage y se propaga entre componentes con
 * un evento de window, así el velo y los avisos reaccionan sin contexto.
 */
const STORAGE_KEY = 'basta_despierto';
const EVENT_NAME = 'basta:despertar';

export function estaDespierto(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Marca el sitio como despierto y avisa a todos los suscriptores. */
export function despertar(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Sin storage (modo incógnito estricto) el despertar dura la sesión en memoria.
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useDespierto(): boolean {
  const [despierto, setDespierto] = useState(estaDespierto);

  useEffect(() => {
    const onDespertar = () => {
      setDespierto(true);
    };
    window.addEventListener(EVENT_NAME, onDespertar);
    return () => {
      window.removeEventListener(EVENT_NAME, onDespertar);
    };
  }, []);

  return despierto;
}
