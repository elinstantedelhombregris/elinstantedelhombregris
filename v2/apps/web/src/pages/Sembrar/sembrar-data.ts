/**
 * Sembrar (spec 2.5) — los tres pasos del asistente y la persistencia
 * local del certificado. El copy es el de la spec, carácter por carácter.
 */
export interface PasoSemilla {
  campo: 'basta' | 'sueno' | 'compromiso';
  titulo: string;
  guia: string;
  placeholder: string;
}

export const LARGO_MAXIMO = 280;

export const PASOS_SEMILLA: readonly PasoSemilla[] = [
  {
    campo: 'basta',
    titulo: 'Tu basta',
    guia: 'Lo que no estás dispuesto a aguantar ni un día más. Sin diplomacia.',
    placeholder: 'Basta de…',
  },
  {
    campo: 'sueno',
    titulo: 'Tu sueño',
    guia: 'El país que querrías si nadie te dijera que es imposible.',
    placeholder: 'Sueño con…',
  },
  {
    campo: 'compromiso',
    titulo: 'Tu compromiso',
    guia: 'Lo que vas a poner vos. Chiquito y real vale más que épico y falso.',
    placeholder: 'Me comprometo a…',
  },
];

export interface SemillaGuardada {
  id: number;
  /** ISO — createdAt de la base, jamás el reloj del cliente. */
  fecha: string;
  basta: string;
  sueno: string;
  compromiso: string;
}

const STORAGE_KEY = 'basta_semilla';

export function guardarSemilla(semilla: SemillaGuardada): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(semilla));
  } catch {
    // Sin storage el certificado dura la sesión — el registro vive en la base.
  }
}

export function leerSemilla(): SemillaGuardada | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as SemillaGuardada).id !== 'number' ||
      typeof (parsed as SemillaGuardada).basta !== 'string'
    ) {
      return null;
    }
    return parsed as SemillaGuardada;
  } catch {
    return null;
  }
}

export function borrarSemilla(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nada que borrar si no hay storage.
  }
}
