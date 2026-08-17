import type { Tema } from '../radiografia-data';

/**
 * § El interruptor papel / nocturno.
 *
 * Vivía adentro de `LaRadiografia.tsx` cuando había una sola página. Desde que
 * el ejemplo tiene ruta propia —`/la-radiografia/ejemplo`, enmienda del
 * 16/8/2026 §3— hay **dos** páginas que gobiernan la misma constelación con el
 * mismo mando, y duplicar veinte líneas de botón era garantizar que un día una
 * de las dos diga «Ver de noche» estando de noche.
 *
 * Gobierna la constelación, no el chrome del sitio: `PAPEL_ROUTES` ya dice que
 * estas rutas nacen papel.
 */

export interface InterruptorDeTemaProps {
  readonly tema: Tema;
  readonly onCambiar: (tema: Tema) => void;
}

export function InterruptorDeTema({ tema, onCambiar }: InterruptorDeTemaProps) {
  const nocturno = tema === 'nocturno';
  return (
    <button
      type="button"
      aria-pressed={nocturno}
      onClick={() => {
        onCambiar(nocturno ? 'papel' : 'nocturno');
      }}
      className={`font-space border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
        nocturno
          ? 'border-oscuro-borde text-oscuro-secundario hover:text-oscuro-texto'
          : 'border-tinta text-tinta hover:bg-papel-presionado'
      }`}
    >
      {nocturno ? 'Ver en papel' : 'Ver de noche'}
    </button>
  );
}
